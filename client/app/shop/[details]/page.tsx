/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Star, Minus, Plus } from "lucide-react";
import { ProductApi } from "@/lib/api/catalog/product";
import { CategoryApi } from "@/lib/api/catalog/category";
import type { OptionDto, ProductDto } from "@/lib/api/catalog/types";
import { ProductCard } from "@/components/ui/Product-Card";
import { CustomerApi } from "@/lib/api/identity/customer";
import { appendCartLine, productPrefillKey } from "@/lib/utils/storeCart";
import { readCart } from "@/lib/utils/storeCart";
import { ReviewApi, type ReviewDto } from "@/lib/api/reviews";
import { formatPrice } from "@/lib/utils/price";
import { TextArea } from "@/components/ui/Textarea";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Toast } from "@/lib/utils/toast";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";
import { StockService } from "@/lib/services/stock.service";
import { ProductDetailPageSkeleton } from "@/components/ui/Skeletons";
import MediaImage from "@/components/ui/MediaImage";

/* ─── Easing presets ─────────────────────────────────────────── */
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
const EASE_INOUT = [0.45, 0, 0.1, 1] as const;

/* ─── Stagger container ──────────────────────────────────────── */
const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_OUT_EXPO } },
};
const fadeLeft = {
  hidden: { opacity: 0, x: -30 },
  show: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE_OUT_EXPO } },
};

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ details: string }>;
}) {
  const { lang, m } = useI18n();
  const { details: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [product, setProduct] = useState<ProductDto | null>(null);
  const [options, setOptions] = useState<OptionDto[]>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [approvedReviews, setApprovedReviews] = useState<ReviewDto[]>([]);
  const [customerOk, setCustomerOk] = useState<boolean | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [reviewSaving, setReviewSaving] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [availableQty, setAvailableQty] = useState(0);
  const [activeImg, setActiveImg] = useState(0);
  const [reviewsOpen, setReviewsOpen] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<ProductDto[]>([]);

  /* ── Load product ── */
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await ProductApi.getStoreDetailBySlug(id);
        if (cancelled) return;
        setProduct(res.product);
        setOptions(res.options as OptionDto[]);
        const stockRes = await StockService.getPublicByProductId(res.product.id);
        setAvailableQty(Math.max(0, Number(stockRes.stock.availableQty) || 0));
        setQuantity(1);
        const init: Record<string, string> = {};
        for (const row of res.product.options ?? []) init[row.optionId] = "";
        const preKey = productPrefillKey(res.product.id);
        const rawPref =
          typeof sessionStorage !== "undefined" ? sessionStorage.getItem(preKey) : null;
        if (rawPref) {
          try {
            const data = JSON.parse(rawPref) as { picked?: Record<string, unknown> };
            if (data?.picked && typeof data.picked === "object") {
              for (const [oid, key] of Object.entries(data.picked)) {
                if (init[oid] !== undefined && typeof key === "string") init[oid] = key;
              }
            }
          } catch { /* ignore */ }
          sessionStorage.removeItem(preKey);
        }
        setPicked(init);
      } catch {
        if (!cancelled) setErr(m.pages.productDetail.notFound);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [id]);

  /* ── Load reviews ── */
  useEffect(() => {
    if (!product?.id) return;
    let cancelled = false;
    ReviewApi.listApprovedForProduct(product.id)
      .then((r) => { if (!cancelled) setApprovedReviews(r.reviews); })
      .catch(() => { if (!cancelled) setApprovedReviews([]); });
    return () => { cancelled = true; };
  }, [product?.id]);

  /* ── Auth check ── */
  useEffect(() => {
    let cancelled = false;
    CustomerApi.me()
      .then(() => { if (!cancelled) setCustomerOk(true); })
      .catch(() => { if (!cancelled) setCustomerOk(false); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    Promise.all([ProductApi.listPublic(), CategoryApi.listPublic()])
      .then(([productRes, categoryRes]) => {
        if (cancelled) return;

        const allProducts = productRes.products ?? [];
        const categories = categoryRes.categories ?? [];
        const currentCategoryIds = new Set(product.categoryIds ?? []);

        const relatedCategoryIds = new Set<string>(currentCategoryIds);
        const parentCategoryIds = new Set(
          categories
            .filter((category) => currentCategoryIds.has(category.id) && category.parentCategoryId)
            .map((category) => category.parentCategoryId!)
        );

        categories.forEach((category) => {
          if (currentCategoryIds.has(category.parentCategoryId ?? "")) {
            relatedCategoryIds.add(category.id);
          }
          if (parentCategoryIds.has(category.parentCategoryId ?? "")) {
            relatedCategoryIds.add(category.id);
          }
        });

        parentCategoryIds.forEach((id) => relatedCategoryIds.add(id));

        const related = allProducts
          .filter((item) => item.id !== product.id)
          .filter((item) => item.categoryIds.some((id) => relatedCategoryIds.has(id)))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 6);

        if (!cancelled) setRelatedProducts(related);
      })
      .catch(() => {
        if (!cancelled) setRelatedProducts([]);
      });

    return () => { cancelled = true; };
  }, [product]);

  const optionById = useMemo(() => new Map(options.map((o) => [o.id, o])), [options]);

  const galleryUrls = useMemo(
    () => (product?.images ?? []).map((u) => resolveMediaUrl(u)).filter(Boolean),
    [product?.images]
  );

  const totalPrice = useMemo(() => product?.price ?? 0, [product]);

  const hasOffer =
    !!product?.hasOffer && (product.originalPrice ?? product.price) > product.price;

  const selectionsValid = useMemo(() => {
    if (!product?.options?.length) return true;
    return product.options.every((row) => !!picked[row.optionId]);
  }, [product, picked]);

  function sameSelections(
    a?: Array<{ optionId: string; valueKeys: string[] }>,
    b?: Array<{ optionId: string; valueKeys: string[] }>
  ) {
    const norm = (rows?: Array<{ optionId: string; valueKeys: string[] }>) =>
      (rows ?? [])
        .map((r) => ({ optionId: r.optionId, valueKeys: [...(r.valueKeys ?? [])].sort() }))
        .sort((x, y) => x.optionId.localeCompare(y.optionId));
    return JSON.stringify(norm(a)) === JSON.stringify(norm(b));
  }

  const avgRating = useMemo(() => {
    if (!approvedReviews.length) return 0;
    return approvedReviews.reduce((s, r) => s + r.rating, 0) / approvedReviews.length;
  }, [approvedReviews]);

  /* ─────────────────────────────────────── LOADING / ERROR ──── */
  if (loading) return <ProductDetailPageSkeleton />;

  if (err || !product)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-sm tracking-[0.15em] uppercase text-black/50">
          {err ?? m.common.notFound}
        </p>
      </div>
    );

  /* ─────────────────────────────────────── PAGE ──────────────── */
  return (
    <div
      className="min-h-screen container mx-auto px-4 w-full overflow-hidden"
      style={{ fontFeatureSettings: '"ss01"' }}
    >
      {/* ── Back nav ── */}
      <motion.div
        className="px-6 md:px-12 pt-6 pb-2"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
      >
        <Link
          href="/shop"
          className="inline-flex items-center gap-1 text-[10px] tracking-[0.22em] uppercase text-black/45 hover:text-black transition-colors duration-200"
        >
          <ChevronLeft size={11} strokeWidth={1.5} />
          {m.pages.productDetail.backToShop}
        </Link>
      </motion.div>

      {/* ── Main two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] min-h-[85vh]">

        {/* ════════════ LEFT — Gallery ════════════ */}
        <motion.div
          className="relative"
          variants={fadeLeft}
          initial="hidden"
          animate="show"
        >
          {galleryUrls.length > 0 ? (
            <div className="h-screen lg:sticky top-0 bottom-0 flex flex-col">

              {/* Main image */}
              <div className="relative flex-1 overflow-hidden bg-neutral-50 min-h-[60vw] lg:min-h-0">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImg}
                    src={galleryUrls[activeImg]}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    initial={{ opacity: 0, scale: 1.03 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5, ease: EASE_INOUT }}
                  />
                </AnimatePresence>

                {/* Offer badge */}
                {hasOffer && (
                  <div className="absolute top-5 left-5 z-10 bg-black text-white text-[9px] tracking-[0.2em] uppercase px-2.5 py-1">
                    {product.offerBadge || m.pages.offers.badge}
                    {product.offerLabel ? ` · ${product.offerLabel}` : ""}
                  </div>
                )}

                {/* Prev / Next arrows — only if multiple images */}
                {galleryUrls.length > 1 && (
                  <>
                    <button
                      type="button"
                      aria-label="Previous image"
                      onClick={() => setActiveImg((i) => (i - 1 + galleryUrls.length) % galleryUrls.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors duration-150"
                    >
                      <ChevronLeft size={16} strokeWidth={1.5} />
                    </button>
                    <button
                      type="button"
                      aria-label="Next image"
                      onClick={() => setActiveImg((i) => (i + 1) % galleryUrls.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors duration-150"
                    >
                      <ChevronRight size={16} strokeWidth={1.5} />
                    </button>
                  </>
                )}

                 {/* Thumbnail strip */}
              {galleryUrls.length > 1 && (
                <div className="flex gap-1 p-2 bg-white overflow-x-auto shrink-0">
                  {galleryUrls.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImg(i)}
                    className="relative shrink-0 w-16 h-20 overflow-hidden"
                  >
                      <MediaImage
                        src={src}
                        alt=""
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                      <motion.div
                        className="absolute inset-0 border-b-2 border-black"
                        initial={false}
                        animate={{ opacity: i === activeImg ? 1 : 0 }}
                        transition={{ duration: 0.2 }}
                      />
                      {i !== activeImg && (
                        <div className="absolute inset-0 bg-white/40" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Dot indicators */}
                {galleryUrls.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                    {galleryUrls.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveImg(i)}
                        className="relative w-4 h-4 flex items-center justify-center"
                        aria-label={`Image ${i + 1}`}
                      >
                        <span
                          className="block transition-all duration-300"
                          style={{
                            width: i === activeImg ? 16 : 4,
                            height: 2,
                            background: i === activeImg ? "#000" : "rgba(0,0,0,0.3)",
                          }}
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

             
            </div>
          ) : (
            <div className="lg:sticky lg:top-0 lg:h-screen bg-neutral-50 flex items-center justify-center">
              <span className="text-[10px] tracking-[0.25em] uppercase text-neutral-300">
                {m.common.noImage}
              </span>
            </div>
          )}
        </motion.div>

        {/* ════════════ RIGHT — Product info ════════════ */}
        <motion.div
          className="flex flex-col h-full"
          variants={staggerContainer}
          initial="hidden"
          animate="show"
        >
          <div className="px-8 md:px-10 pt-8 pb-10 flex flex-col gap-0 flex-1">

            {/* ── Brand / category breadcrumb ── */}
            <motion.p
              variants={fadeUp}
              className="text-[9px] tracking-[0.3em] uppercase text-black/35 mb-4"
            >
              {m.pages.shop?.title ?? "Shop"}
            </motion.p>

            {/* ── Product name ── */}
            <motion.h1
              variants={fadeUp}
              className="text-[13px] tracking-[0.12em] uppercase font-normal text-black leading-relaxed mb-1"
            >
              {pickLocalized(product.name, lang) || product.slug}
            </motion.h1>

            {/* ── Price ── */}
            <motion.div variants={fadeUp} className="flex items-baseline gap-3 mb-8">
              <span className="text-sm tracking-[0.08em] text-black">
                {formatPrice(totalPrice)}
              </span>
              {hasOffer && (
                <span className="text-xs tracking-[0.06em] text-black/35 line-through">
                  {formatPrice(product.originalPrice ?? 0)}
                </span>
              )}
            </motion.div>

            {/* ── Thin divider ── */}
            <motion.div variants={fadeUp} className="h-px bg-black/8 mb-8" />

          
           {/* ── Options ── */}
{(product.options ?? []).length > 0 && (
  <motion.div variants={fadeUp} className="flex flex-col gap-7 mb-8">
    {(product.options ?? []).map((row) => {
      const opt = optionById.get(row.optionId);
      if (!opt) return null;
      const allowed =
        row.valueKeys?.length > 0
          ? (opt.values ?? []).filter((v) => row.valueKeys.includes(v.key))
          : opt.values ?? [];
      const isColor = opt.type === "color";

      // Resolve the actual CSS color for a value:
      // prefer v.hex, then fall back to v.value if it looks like a color token
      const resolveColor = (v: (typeof allowed)[number]) =>
        v.hex ?? (v.value?.startsWith("#") || v.value?.startsWith("rgb") ? v.value : null);

      const selectedValue = allowed.find((v) => v.key === picked[row.optionId]);

      return (
        <div key={row.optionId}>
          <p className="text-[9px] tracking-[0.28em] uppercase text-black/45 mb-3 flex items-center gap-2">
            {pickLocalized(opt.name, lang)}

            {/* Selected indicator — colored dot for color options, text for others */}
            {selectedValue && (
              <span className="flex items-center gap-1.5">
                <span className="text-black/30">—</span>
                {isColor ? (
                  <>
                    <span
                      className="inline-block w-3 h-3 rounded-full border border-black/15 shrink-0"
                      style={{ backgroundColor: resolveColor(selectedValue) ?? "#000" }}
                    />
                    {/* Only show a name if it isn't a raw hex/rgb string */}
                    {selectedValue.value &&
                      !selectedValue.value.startsWith("#") &&
                      !selectedValue.value.startsWith("rgb") && (
                        <span className="text-black/70 normal-case tracking-normal">
                          {selectedValue.value}
                        </span>
                      )}
                  </>
                ) : (
                  <span className="text-black/70 normal-case tracking-normal">
                    {selectedValue.value ?? selectedValue.key}
                  </span>
                )}
              </span>
            )}
          </p>

          <div className="flex flex-wrap gap-2">
            {allowed.map((v) => {
              const sel = picked[row.optionId] === v.key;
              const cssColor = resolveColor(v);

              return isColor ? (
                /* ── Color swatch ── */
                <button
                  key={v.key}
                  type="button"
                  aria-label={
                    v.value && !v.value.startsWith("#") && !v.value.startsWith("rgb")
                      ? v.value
                      : v.key
                  }
                  title={
                    v.value && !v.value.startsWith("#") && !v.value.startsWith("rgb")
                      ? v.value
                      : v.key
                  }
                  onClick={() =>
                    setPicked((p) => ({ ...p, [row.optionId]: sel ? "" : v.key }))
                  }
                  className="relative w-6 h-6 rounded-full transition-transform duration-200 hover:scale-110"
                  style={{ backgroundColor: cssColor ?? "#000" }}
                >
                  {/* Selection ring */}
                  <motion.span
                    className="absolute inset-[-3px] rounded-full border border-black pointer-events-none"
                    initial={false}
                    animate={{ opacity: sel ? 1 : 0, scale: sel ? 1 : 0.8 }}
                    transition={{ duration: 0.18 }}
                  />
                  {/* White check for dark swatches */}
                  {sel && (
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span
                        className="block w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: "rgba(255,255,255,0.7)" }}
                      />
                    </span>
                  )}
                </button>
              ) : (
                /* ── Size / text chip ── */
                <motion.button
                  key={v.key}
                  type="button"
                  onClick={() =>
                    setPicked((p) => ({ ...p, [row.optionId]: sel ? "" : v.key }))
                  }
                  className="relative text-[10px] tracking-[0.18em] uppercase px-4 py-2 border"
                  animate={{
                    borderColor: sel ? "#000" : "rgba(0,0,0,0.15)",
                    backgroundColor: sel ? "#000" : "#fff",
                    color: sel ? "#fff" : "#000",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {v.value ?? v.key}
                </motion.button>
              );
            })}
          </div>
        </div>
      );
    })}
  </motion.div>
)}

            {/* ── Quantity + stock ── */}
            <motion.div variants={fadeUp} className="flex items-center gap-0 mb-2">
              <button
                type="button"
                disabled={quantity <= 1}
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                className="w-10 h-10 flex items-center justify-center border border-black/15 hover:border-black disabled:opacity-30 transition-colors duration-150"
              >
                <Minus size={11} strokeWidth={1.5} />
              </button>
              <div className="w-12 h-10 flex items-center justify-center border-t border-b border-black/15 text-[12px] tracking-[0.1em]">
                {quantity}
              </div>
              <button
                type="button"
                onClick={() => setQuantity((q) => q + 1)}
                className="w-10 h-10 flex items-center justify-center border border-black/15 hover:border-black transition-colors duration-150"
              >
                <Plus size={11} strokeWidth={1.5} />
              </button>
              <span className="ml-4 text-[10px] tracking-[0.1em] text-black/40">
                {availableQty > 0
                  ? m.pages.productDetail.inStockCount?.replace("{n}", String(availableQty))
                  : m.pages.productDetail.outOfStock}
              </span>
            </motion.div>

            {/* ── Add to cart CTA ── */}
            <motion.div variants={fadeUp} className="mt-6 mb-8">
              <motion.button
                type="button"
                disabled={!selectionsValid || availableQty <= 0}
                whileTap={{ scale: 0.985 }}
                onClick={() => {
                  const line: {
                    productId: string;
                    quantity: number;
                    selections?: Array<{ optionId: string; valueKeys: string[] }>;
                  } = { productId: product.id, quantity };
                  if ((product.options ?? []).length > 0) {
                    line.selections = Object.entries(picked).map(([optionId, key]) => ({
                      optionId,
                      valueKeys: key ? [key] : [],
                    }));
                  }
                  const existingQty = readCart()
                    .filter((c) => c.productId === product.id && sameSelections(c.selections, line.selections))
                    .reduce((sum, c) => sum + (Number(c.quantity) || 0), 0);
                  if (existingQty + quantity > availableQty) {
                    Toast.error(m.pages.productDetail.stockLimit?.replace("{n}", String(availableQty)));
                    return;
                  }
                  appendCartLine(line);
                  Toast.addToCart();
                }}
                className="w-full h-12 bg-black text-white text-[10px] tracking-[0.28em] uppercase font-medium flex items-center justify-center gap-2 hover:bg-neutral-800 transition-colors duration-200 disabled:bg-black/20 disabled:cursor-not-allowed"
              >
                {m.pages.shop.addToCart}
              </motion.button>

            </motion.div>

            {/* ── Description accordion ── */}
            <motion.div variants={fadeUp} className="border-t border-black/8">
              <button
                type="button"
                onClick={() => setDetailsOpen((v) => !v)}
                className="w-full flex items-center justify-between py-4 text-[10px] tracking-[0.22em] uppercase text-black hover:text-black/60 transition-colors duration-150"
              >
                <span>{m.pages.productDetail?.description}</span>
                <motion.span
                  animate={{ rotate: detailsOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-base leading-none"
                >
                  +
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {detailsOpen && (
                  <motion.div
                    key="desc"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.35, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden"
                  >
                    <p className="pb-5 text-[12px] leading-relaxed text-black/60 whitespace-pre-wrap">
                      {pickLocalized(product.description, lang) || "—"}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Reviews accordion ── */}
            <motion.div variants={fadeUp} className="border-t border-b border-black/8">
              <button
                type="button"
                onClick={() => setReviewsOpen((v) => !v)}
                className="w-full flex items-center justify-between py-4 text-[10px] tracking-[0.22em] uppercase text-black hover:text-black/60 transition-colors duration-150"
              >
                <span className="flex items-center gap-3">
                  {m.pages.productDetail.reviewsTitle}
                  {approvedReviews.length > 0 && (
                    <span className="flex items-center gap-1 text-[9px] tracking-[0.1em] text-black/45">
                      <Star size={9} className="fill-black text-black" />
                      {avgRating.toFixed(1)} ({approvedReviews.length})
                    </span>
                  )}
                </span>
                <motion.span
                  animate={{ rotate: reviewsOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="text-base leading-none"
                >
                  +
                </motion.span>
              </button>

              <AnimatePresence initial={false}>
                {reviewsOpen && (
                  <motion.div
                    key="reviews"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                    className="overflow-hidden"
                  >
                    <div className="pb-6 space-y-5">

                      {/* Review list */}
                      {approvedReviews.length === 0 ? (
                        <p className="text-[11px] tracking-[0.1em] text-black/35">
                          {m.pages.productDetail.noReviews}
                        </p>
                      ) : (
                        <ul className="space-y-4">
                          {approvedReviews.map((rev) => (
                            <li key={rev.id} className="border-l-2 border-black/10 pl-4">
                              <div className="flex items-center gap-0.5 mb-1.5">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star
                                    key={i}
                                    size={10}
                                    strokeWidth={1.5}
                                    className={i < rev.rating ? "fill-black text-black" : "text-black/20"}
                                  />
                                ))}
                              </div>
                              <p className="text-[11px] leading-relaxed text-black/65 whitespace-pre-wrap">
                                {rev.description}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}

                      {/* Write review */}
                      {customerOk === false ? (
                        <p className="text-[11px] tracking-[0.08em] text-black/40">
                          <a href="/account/login" className="underline underline-offset-2">
                            {m.pages.productDetail.signIn}
                          </a>{" "}
                          {m.pages.productDetail.signInToReview}
                        </p>
                      ) : customerOk === true ? (
                        <div className="pt-3 border-t border-black/8 space-y-4">
                          <p className="text-[9px] tracking-[0.25em] uppercase text-black/40">
                            {m.pages.productDetail.writeReview}
                          </p>

                          {/* Star rating picker */}
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <button
                                key={n}
                                type="button"
                                onClick={() => setReviewRating(n)}
                                className="p-0.5 transition-transform duration-100 hover:scale-110"
                              >
                                <Star
                                  size={16}
                                  strokeWidth={1.5}
                                  className={n <= reviewRating ? "fill-black text-black" : "text-black/20"}
                                />
                              </button>
                            ))}
                          </div>

                          <TextArea
                            className="w-full border border-black/15 bg-white px-3 py-2.5 text-[11px] leading-relaxed text-black placeholder:text-black/30 focus:outline-none focus:border-black transition-colors duration-200 min-h-[90px] resize-none"
                            value={reviewText}
                            onChange={(e) => setReviewText(e.target.value)}
                            placeholder={m.pages.productDetail.reviewPlaceholder}
                          />

                          <button
                            type="button"
                            disabled={reviewSaving || reviewText.trim().length < 4 || !product.id}
                            onClick={async () => {
                              if (!product.id) { Toast.error(m.pages.productDetail.invalidProductId); return; }
                              setReviewSaving(true);
                              try {
                                await ReviewApi.createForProduct(product.id, {
                                  rating: reviewRating,
                                  description: reviewText.trim(),
                                });
                                Toast.success(m.pages.productDetail.reviewPending);
                                setReviewText("");
                              } catch (e) {
                                Toast.error(getApiErrorMessage(e));
                              } finally {
                                setReviewSaving(false);
                              }
                            }}
                            className="text-[10px] tracking-[0.2em] uppercase border border-black px-5 py-2.5 hover:bg-black hover:text-white transition-colors duration-200 disabled:opacity-35 disabled:cursor-not-allowed"
                          >
                            {reviewSaving ? "···" : m.pages.productDetail.submitReview}
                          </button>
                        </div>
                      ) : null}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

          </div>
        </motion.div>
      </div>

      {relatedProducts.length > 0 && (
        <section className="px-6 md:px-12 pb-16 mt-12">
          <div className="mb-8">
            <h2 className="text-[18px] tracking-[0.15em] uppercase text-black font-semibold">
              {m.pages.productDetail.relatedProducts}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {relatedProducts.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
