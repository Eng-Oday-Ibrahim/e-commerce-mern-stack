"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, ShoppingBag, Option } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { ProductDto } from "@/lib/api/catalog/types";
import { formatPrice } from "@/lib/utils/price";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { appendCartLine } from "@/lib/utils/storeCart";
import { Toast } from "@/lib/utils/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";
import { WishlistService } from "@/lib/services/wishlist.service";
import MediaImage from "@/components/ui/MediaImage";

type Props = {
  product: ProductDto;
};

export function ProductCard({ product }: Props) {
  const router = useRouter();
  const { lang, m } = useI18n();
  const hasOptions = (product.options ?? []).length > 0;
  const imageUrl = resolveMediaUrl(product.images?.[0]);
  const [wished, setWished] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [adding, setAdding] = useState(false);

  const hasOffer =
    !!product.hasOffer && (product.originalPrice ?? product.price) > product.price;

  const offerLabel =
    hasOffer && product.offerLabel
      ? lang === "ar"
        ? `${m.pages.offers.discountPrefix} ${product.offerLabel.replace(" OFF", "")}`
        : product.offerLabel
      : undefined;

  async function addDirectToCart() {
    setAdding(true);
    appendCartLine({ productId: product.id, quantity: 1 });
    Toast.addToCart();
    await new Promise((r) => setTimeout(r, 600));
    setAdding(false);
  }

  useEffect(() => {
    let cancelled = false;
    WishlistService.has(product.id)
      .then((v) => { if (!cancelled) setWished(v); })
      .catch(() => { if (!cancelled) setWished(false); });
    return () => { cancelled = true; };
  }, [product.id]);

  return (
    <article className="group flex flex-col bg-gray-50">

      {/* ── Image wrapper ── */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ aspectRatio: "3/4" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <Link href={`/shop/${product.slug}`} className="block w-full h-full" tabIndex={-1}>

          {/* Product image with subtle zoom */}
          <motion.div
            className="relative w-full h-full"
            animate={{ scale: hovered ? 1.04 : 1 }}
            transition={{ duration: 0.65, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            {imageUrl ? (
              <MediaImage
                src={imageUrl}
                alt={typeof product.name === "string" ? product.name : product.slug}
                fill
                sizes="(max-width: 768px) 50vw, 25vw"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                <span className="text-xs tracking-[0.2em] uppercase text-neutral-400">
                  {m.common.noImage}
                </span>
              </div>
            )}
          </motion.div>

          {/* Subtle dark scrim on hover — so overlays read cleanly */}
          <motion.div
            className="absolute inset-0 bg-black pointer-events-none"
            animate={{ opacity: hovered ? 0.12 : 0 }}
            transition={{ duration: 0.4 }}
          />
        </Link>

        {/* ── Offer badge — top left ── */}
        {hasOffer && (
          <div className="absolute top-3 left-3 z-10 pointer-events-none">
            <span className="block bg-black text-white text-[9px] tracking-[0.18em] uppercase px-2 py-1 font-medium">
              {product.offerBadge || m.pages.offers.badge}
              {offerLabel ? ` · ${offerLabel}` : ""}
            </span>
          </div>
        )}

        {/* ── Wishlist heart — top right, revealed on hover ── */}
        <AnimatePresence>
          {hovered && (
            <motion.button
              key="wishlist"
              type="button"
              aria-label="Toggle wishlist"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              className="absolute top-3 right-3 z-20 w-8 h-8 flex items-center justify-center bg-white/95 backdrop-blur-sm"
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();
                try {
                  const out = await WishlistService.toggle(product.id);
                  setWished(out.wished);
                } catch {
                  router.push("/account/login");
                }
              }}
            >
              <motion.div
                animate={wished ? { scale: [1, 1.35, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <Heart
                  size={13}
                  strokeWidth={1.5}
                  className={wished ? "fill-black text-black" : "text-black"}
                />
              </motion.div>
            </motion.button>
          )}
        </AnimatePresence>

        {/* ── CTA button — slides up from bottom of image on hover ── */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="cta"
              className="absolute bottom-0 left-0 right-0 z-20 px-4 pb-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 14, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {hasOptions ? (
                <button
                  type="button"
                  className="w-full bg-white text-black text-[10px] tracking-[0.22em] uppercase font-semibold py-3 hover:bg-black hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/shop/${product.slug}`);
                  }}
                >
                 <Option size={12} strokeWidth={1.8} />
                                    <motion.span
                    key={adding ? "adding" : "idle"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {m.pages.shop.selectOptions}
                  </motion.span>
                </button>
              ) : (
                <button
                  type="button"
                  disabled={adding}
                  className="w-full bg-white text-black text-[10px] tracking-[0.22em] uppercase font-semibold py-3 hover:bg-black hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 disabled:opacity-60"
                  onClick={(e) => {
                    e.preventDefault();
                    addDirectToCart();
                  }}
                >
                  <ShoppingBag size={12} strokeWidth={1.8} />
                  <motion.span
                    key={adding ? "adding" : "idle"}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.18 }}
                  >
                    {adding ? "···" : m.pages.shop.addToCart}
                  </motion.span>
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Product info — below image ── */}
      <Link href={`/shop/${product.slug}`} className="flex flex-col gap-1 pt-3 pb-1 px-0">

        {/* Name */}
        <h3 className="text-lg tracking-[0.12em] uppercase text-black font-normal leading-snug line-clamp-2 hover:opacity-60 transition-opacity duration-200">
          {pickLocalized(product.name, lang) || product.slug}
        </h3>

        {/* Price row */}
        <div className="flex items-baseline gap-2 mt-0.5">
          <span className="text-md tracking-[0.08em] text-black font-medium">
            {formatPrice(product.price ?? 0)}
          </span>
          {hasOffer && (
            <span className="text-sm tracking-[0.06em] text-neutral-400 line-through">
              {formatPrice(product.originalPrice ?? 0)}
            </span>
          )}
        </div>

      </Link>
    </article>
  );
}

export default ProductCard;
