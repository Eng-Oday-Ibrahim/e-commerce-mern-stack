/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal, ChevronDown } from "lucide-react";
import { ProductApi } from "@/lib/api/catalog/product";
import { CategoryApi } from "@/lib/api/catalog/category";
import { CollectionApi } from "@/lib/api/catalog/collection";
import type { CategoryDto, CollectionDto, ProductDto } from "@/lib/api/catalog/types";
import { ProductCard } from "@/components/ui/Product-Card";
import  Empty  from "@/components/ui/Empty";
import { parsePrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";

type SortKey = "newest" | "price-asc" | "price-desc" | "name-asc" | "name-desc";
const NEW_ARRIVAL_MS = 30 * 24 * 60 * 60 * 1000;
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px">
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-neutral-100"
          style={{ aspectRatio: "3/4" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.35, 0.7, 0.35] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.1 }}
        />
      ))}
    </div>
  );
}

/* ─── Filter pill ────────────────────────────────────────────── */
function FilterPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <motion.button
      type="button"
      onClick={onRemove}
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.88 }}
      transition={{ duration: 0.18 }}
      className="inline-flex items-center gap-1.5 border border-black/25 px-2.5 py-1 text-[9px] tracking-[0.18em] uppercase text-black hover:bg-black hover:text-white hover:border-black transition-colors duration-200"
    >
      {label}
      <X size={8} strokeWidth={2} />
    </motion.button>
  );
}

/* ─── Underline input ────────────────────────────────────────── */
function UnderlineInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      className="w-full bg-transparent border-b border-black/50 focus:border-black pb-1.5 text-[11px] tracking-[0.08em] text-black placeholder:text-black/50 outline-none transition-colors duration-200"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  );
}

/* ─── Underline select ───────────────────────────────────────── */
function UnderlineSelect({ value, onChange, children }: { value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div className="relative">
      <select
        className="w-full appearance-none bg-transparent border-b border-black/50 focus:border-black pb-1.5 pr-5 text-[11px] tracking-[0.08em] text-black outline-none cursor-pointer transition-colors duration-200"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {children}
      </select>
      <ChevronDown size={10} strokeWidth={1.5} className="absolute right-0 bottom-2.5 pointer-events-none text-black/50" />
    </div>
  );
}

/* ─── Toggle pill ────────────────────────────────────────────── */
function TogglePill({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <motion.button
      type="button"
      onClick={() => onChange(!checked)}
      animate={{
        backgroundColor: checked ? "#000" : "#fff",
        color: checked ? "#fff" : "rgba(0,0,0,0.55)",
        borderColor: checked ? "#000" : "rgba(0,0,0,0.18)",
      }}
      transition={{ duration: 0.2 }}
      className="border px-3 py-1.5 text-[9px] tracking-[0.2em] uppercase"
    >
      {label}
    </motion.button>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function StoreProductsPage() {
  const { lang, m } = useI18n();

  // Read ?category=slug and ?collection=slug from the URL
  const searchParams    = useSearchParams();
  const urlCategorySlug = searchParams.get("category")   ?? "";
  const urlCollectionSlug = searchParams.get("collection") ?? "";
  const urlFeatured = searchParams.get("featured") ?? "";

  const [products, setProducts]       = useState<ProductDto[] | null>(null);
  const [categories, setCategories]   = useState<CategoryDto[]>([]);
  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [err, setErr]                 = useState<string | null>(null);

  const [query, setQuery]                     = useState("");
  const [priceMin, setPriceMin]               = useState("");
  const [priceMax, setPriceMax]               = useState("");
  const [newArrivalsOnly, setNewArrivalsOnly] = useState(false);
  const [categoryId, setCategoryId]           = useState("");
  const [collectionId, setCollectionId]       = useState("");
  const [inStockOnly, setInStockOnly]         = useState(false);
  const [offersOnly, setOffersOnly]           = useState(false);
  const [featuredOnly, setFeaturedOnly]       = useState(false);
  const [minRating, setMinRating]             = useState("0");
  const [newArrivalsCutoff, setNewArrivalsCutoff] = useState(0);
  const [sort, setSort]                       = useState<SortKey>("newest");
  const [filterOpen, setFilterOpen]           = useState(false);

  /* ── Load data then resolve URL slugs → IDs ── */
  useEffect(() => {
    let cancelled = false;
    Promise.all([ProductApi.listPublic(), CategoryApi.listPublic(), CollectionApi.listPublic()])
      .then(([pRes, cRes, colRes]) => {
        if (cancelled) return;

        const cats = cRes.categories ?? [];
        const cols = colRes.collections ?? [];
        setProducts(pRes.products ?? []);
        setCategories(cats);
        setCollections(cols);

        // Resolve URL param slugs → IDs and pre-fill the filters
        if (urlCategorySlug) {
          const match = cats.find((c) => c.slug === urlCategorySlug);
          if (match) { setCategoryId(match.id); setFilterOpen(true); }
        }
        if (urlCollectionSlug) {
          const match = cols.find((c) => c.slug === urlCollectionSlug);
          if (match) { setCollectionId(match.id); setFilterOpen(true); }
        }
        if (urlFeatured.toLowerCase() === "true") {
          setFeaturedOnly(true);
          setFilterOpen(true);
        }
      })
      .catch((e) => { if (!cancelled) setErr(getApiErrorMessage(e)); });
    return () => { cancelled = true; };
  }, [urlCategorySlug, urlCollectionSlug, urlFeatured]);
  // Re-runs if the user navigates from one collection/category to another without unmounting

  useEffect(() => { setNewArrivalsCutoff(Date.now() - NEW_ARRIVAL_MS); }, []);

  const SORT_OPTIONS: { key: SortKey; label: string }[] = [
    { key: "newest",     label: m.pages.shop.sortNewest    },
    { key: "price-asc",  label: m.pages.shop.sortPriceAsc  },
    { key: "price-desc", label: m.pages.shop.sortPriceDesc },
    { key: "name-asc",   label: m.pages.shop.sortNameAsc   },
    { key: "name-desc",  label: m.pages.shop.sortNameDesc  },
  ];

  /* ── Filter + sort ── */
  const filteredSorted = useMemo(() => {
    let list = [...(products ?? [])];
    const min = priceMin.trim() ? parsePrice(priceMin) : null;
    const max = priceMax.trim() ? parsePrice(priceMax) : null;
    const q   = query.trim().toLowerCase();
    const minRatingNum = Number(minRating) || 0;

    if (q)            list = list.filter((p) => `${pickLocalized(p.name, lang)} ${pickLocalized(p.description, lang)} ${p.slug}`.toLowerCase().includes(q));
    if (min != null)  list = list.filter((p) => (p.price ?? 0) >= min);
    if (max != null)  list = list.filter((p) => (p.price ?? 0) <= max);
    if (categoryId)   list = list.filter((p) => (p.categoryIds ?? []).includes(categoryId));
    if (collectionId) list = list.filter((p) => (p.collectionIds ?? []).includes(collectionId));
    if (inStockOnly)  list = list.filter((p) => !!p.inStock);
    if (offersOnly)   list = list.filter((p) => !!p.hasOffer);
    if (featuredOnly) list = list.filter((p) => !!p.isFeatured);
    if (minRatingNum > 0) list = list.filter((p) => (p.avgRating ?? 0) >= minRatingNum);
    if (newArrivalsOnly)  list = list.filter((p) => { const t = p.createdAt ? new Date(p.createdAt).getTime() : 0; return t >= newArrivalsCutoff; });

    const name = (p: ProductDto) => (pickLocalized(p.name, lang) || p.slug || "").toLowerCase();
    switch (sort) {
      case "price-asc":  list.sort((a, b) => (a.price ?? 0) - (b.price ?? 0)); break;
      case "price-desc": list.sort((a, b) => (b.price ?? 0) - (a.price ?? 0)); break;
      case "name-asc":   list.sort((a, b) => name(a).localeCompare(name(b)));  break;
      case "name-desc":  list.sort((a, b) => name(b).localeCompare(name(a)));  break;
      default:           list.sort((a, b) => { const ta = a.createdAt ? new Date(a.createdAt).getTime() : 0; const tb = b.createdAt ? new Date(b.createdAt).getTime() : 0; return tb - ta; });
    }
    return list;
  }, [products, query, priceMin, priceMax, categoryId, collectionId, inStockOnly, offersOnly, featuredOnly, minRating, newArrivalsOnly, newArrivalsCutoff, sort, lang]);

  /* ── Active pills ── */
  const activePills = useMemo(() => {
    const pills: { key: string; label: string; clear: () => void }[] = [];
    if (query)        pills.push({ key: "q",      label: `"${query}"`,           clear: () => setQuery("")          });
    if (priceMin)     pills.push({ key: "pmin",   label: `≥ ${priceMin}`,        clear: () => setPriceMin("")       });
    if (priceMax)     pills.push({ key: "pmax",   label: `≤ ${priceMax}`,        clear: () => setPriceMax("")       });
    if (categoryId)   { const c = categories.find((c) => c.id === categoryId);    if (c) pills.push({ key: "cat", label: pickLocalized(c.name, lang) || c.slug, clear: () => setCategoryId("")   }); }
    if (collectionId) { const c = collections.find((c) => c.id === collectionId); if (c) pills.push({ key: "col", label: pickLocalized(c.name, lang) || c.slug, clear: () => setCollectionId("") }); }
    if (inStockOnly)    pills.push({ key: "stock",  label: m.pages.shop.inStock,    clear: () => setInStockOnly(false)    });
    if (offersOnly)     pills.push({ key: "offers", label: m.pages.shop.onOffer,    clear: () => setOffersOnly(false)     });
    if (featuredOnly)   pills.push({ key: "feat",   label: m.pages.shop.featured,   clear: () => setFeaturedOnly(false)   });
    if (newArrivalsOnly)pills.push({ key: "new",    label: m.pages.shop.newArrivals,clear: () => setNewArrivalsOnly(false)});
    if (minRating !== "0") pills.push({ key: "rating", label: `${minRating}★+`,  clear: () => setMinRating("0")        });
    return pills;
  }, [query, priceMin, priceMax, categoryId, collectionId, inStockOnly, offersOnly, featuredOnly, newArrivalsOnly, minRating, categories, collections, lang]);

  function clearFilters() {
    setQuery(""); setPriceMin(""); setPriceMax("");
    setCategoryId(""); setCollectionId("");
    setInStockOnly(false); setOffersOnly(false);
    setFeaturedOnly(false); setMinRating("0");
    setNewArrivalsOnly(false); setSort("newest");
  }

  const hasFilters = activePills.length > 0;

  return (
    <div className="min-h-screen">

      {/* ══ HEADER ══ */}
      <motion.header
        className="px-6 md:px-12 pt-14 pb-6"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
      >
        <div className="flex items-center justify-between mb-4">
          <p className="text-[9px] tracking-[0.4em] uppercase text-black/60">{m.pages.shop.subtitle ?? "Store"}</p>
          <Link href="/" className="text-[9px] tracking-[0.25em] uppercase text-black/55 hover:text-black transition-colors duration-200 flex items-center gap-1">
            ← {m.nav.home}
          </Link>
        </div>
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <h1 className="text-[clamp(2rem,5.5vw,4.5rem)] font-extralight leading-none tracking-[-0.02em] text-black">
            {/* Show the active category/collection name in the headline when filtering */}
            {categoryId && categories.find((c) => c.id === categoryId)
              ? pickLocalized(categories.find((c) => c.id === categoryId)!.name, lang) || m.pages.shop.title
              : collectionId && collections.find((c) => c.id === collectionId)
              ? pickLocalized(collections.find((c) => c.id === collectionId)!.name, lang) || m.pages.shop.title
              : m.pages.shop.title}
          </h1>
          {products !== null && !err && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] tracking-[0.2em] uppercase text-black/60 pb-1">
              {filteredSorted.length} {filteredSorted.length === 1 ? "Item" : "Items"}
            </motion.p>
          )}
        </div>
        <motion.div className="h-px bg-black mt-5" initial={{ scaleX: 0, originX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.9, delay: 0.2, ease: EASE_EXPO }} />
      </motion.header>

      {/* ══ FILTER BAR ══ */}
      <div className="px-6 md:px-12 border-b border-black/8">

        <div className="flex items-center justify-between gap-4 py-3">
          <motion.button
            type="button"
            onClick={() => setFilterOpen((v) => !v)}
            className="flex items-center gap-2 text-[10px] tracking-[0.22em] uppercase text-black/60 hover:text-black transition-colors duration-200"
            whileTap={{ scale: 0.96 }}
          >
            <SlidersHorizontal size={12} strokeWidth={1.5} />
            Filter
            {hasFilters && (
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="inline-flex items-center justify-center w-4 h-4 bg-black text-white text-[8px] rounded-full">
                {activePills.length}
              </motion.span>
            )}
            <motion.div animate={{ rotate: filterOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
              <ChevronDown size={10} strokeWidth={1.5} />
            </motion.div>
          </motion.button>

          <div className="hidden md:flex items-center overflow-x-auto">
            {SORT_OPTIONS.map((opt) => (
              <button key={opt.key} type="button" onClick={() => setSort(opt.key)}
                className="relative px-3 py-1 text-[9px] tracking-[0.18em] uppercase transition-colors duration-200 whitespace-nowrap"
                style={{ color: sort === opt.key ? "#000" : "rgba(0,0,0,0.35)" }}
              >
                {opt.label}
                {sort === opt.key && (
                  <motion.div layoutId="sort-underline" className="absolute bottom-0 left-3 right-3 h-px bg-black" transition={{ duration: 0.3, ease: EASE_EXPO }} />
                )}
              </button>
            ))}
          </div>

          <div className="md:hidden">
            <UnderlineSelect value={sort} onChange={(v) => setSort(v as SortKey)}>
              {SORT_OPTIONS.map((o) => <option key={o.key} value={o.key}>{o.label}</option>)}
            </UnderlineSelect>
          </div>
        </div>

        {/* Filter panel */}
        <AnimatePresence initial={false}>
          {filterOpen && (
            <motion.div
              key="filters"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE_EXPO }}
              className="overflow-hidden"
            >
              <div className="py-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-8 gap-y-7 border-t border-black/8">

                <div className="col-span-2 xl:col-span-2">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3">{m.pages.shop.search}</p>
                  <UnderlineInput value={query} onChange={setQuery} placeholder={m.pages.shop.searchPlaceholder} />
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3">{m.pages.shop.priceFrom}</p>
                  <UnderlineInput value={priceMin} onChange={setPriceMin} placeholder="0.00" />
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3">{m.pages.shop.priceTo}</p>
                  <UnderlineInput value={priceMax} onChange={setPriceMax} placeholder="999.99" />
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3 flex items-center gap-2">
                    {m.pages.shop.category}
                    {categoryId && <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />}
                  </p>
                  <UnderlineSelect value={categoryId} onChange={setCategoryId}>
                    <option value="">{m.pages.shop.all}</option>
                    {categories.filter((c) => c.isActive !== false).map((c) => (
                      <option key={c.id} value={c.id}>{pickLocalized(c.name, lang) || c.slug}</option>
                    ))}
                  </UnderlineSelect>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3 flex items-center gap-2">
                    {m.pages.shop.collection}
                    {collectionId && <span className="w-1.5 h-1.5 rounded-full bg-black inline-block" />}
                  </p>
                  <UnderlineSelect value={collectionId} onChange={setCollectionId}>
                    <option value="">{m.pages.shop.all}</option>
                    {collections.filter((c) => c.isActive !== false).map((c) => (
                      <option key={c.id} value={c.id}>{pickLocalized(c.name, lang) || c.slug}</option>
                    ))}
                  </UnderlineSelect>
                </div>

                <div>
                  <p className="text-[9px] tracking-[0.25em] uppercase text-black/55 mb-3">{m.pages.shop.minRating}</p>
                  <UnderlineSelect value={minRating} onChange={setMinRating}>
                    <option value="0">{m.pages.shop.any}</option>
                    {["1","2","3","4","5"].map((n) => <option key={n} value={n}>{n}+</option>)}
                  </UnderlineSelect>
                </div>

                <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-5 flex flex-wrap gap-2 items-center pt-1">
                  <TogglePill checked={newArrivalsOnly} onChange={(v) => { setNewArrivalsOnly(v); if (v) setNewArrivalsCutoff(Date.now() - NEW_ARRIVAL_MS); }} label={m.pages.shop.newArrivals} />
                  <TogglePill checked={inStockOnly}  onChange={setInStockOnly}  label={m.pages.shop.inStock}  />
                  <TogglePill checked={offersOnly}   onChange={setOffersOnly}   label={m.pages.shop.onOffer}  />
                  <TogglePill checked={featuredOnly} onChange={setFeaturedOnly} label={m.pages.shop.featured} />
                </div>

                {hasFilters && (
                  <div className="col-span-2 md:col-span-3 lg:col-span-4 xl:col-span-1 flex items-end justify-end">
                    <button type="button" onClick={clearFilters} className="text-[9px] tracking-[0.2em] uppercase text-black/50 hover:text-black underline underline-offset-2 transition-colors duration-200">
                      {m.pages.shop.clearFilters}
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Active filter pills */}
        <AnimatePresence>
          {activePills.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 py-3 border-t border-black/8">
                <AnimatePresence>
                  {activePills.map((pill) => (
                    <FilterPill key={pill.key} label={pill.label} onRemove={pill.clear} />
                  ))}
                </AnimatePresence>
                <button type="button" onClick={clearFilters} className="text-[9px] tracking-[0.18em] uppercase text-black/60 hover:text-black transition-colors duration-200 ml-1">
                  {m.pages.shop.clearFilters}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ══ PRODUCT GRID ══ */}
      <main className="px-6 md:px-12 py-10">
        {products === null && !err && <Skeleton />}

        {err && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[11px] tracking-[0.15em] uppercase text-red-500 py-12">
            {err}
          </motion.p>
        )}

        {products !== null && !err && filteredSorted.length === 0 && (
          <Empty
            variant="products"
            title={m.pages.shop.noProducts}
            description={m.pages.shop.noProductsDescription}
            actionLabel={hasFilters ? m.pages.shop.clearFilters : m.pages.shop.browse}
            onAction={hasFilters ? clearFilters : undefined}
          />
        )}

        {filteredSorted.length > 0 && (
          <motion.div
            className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2"
            initial="hidden"
            animate="show"
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } } }}
          >
            {filteredSorted.map((p) => (
              <motion.div
                key={p.id}
                className="bg-white"
                variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE_EXPO } } }}
              >
                <ProductCard product={p} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}