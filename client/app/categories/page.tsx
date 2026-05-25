"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryApi } from "@/lib/api/catalog/category";
import type { CategoryDto } from "@/lib/api/catalog/types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";
import MediaImage from "@/components/ui/MediaImage";
import Empty from "@/components/ui/Empty";

/* ─── Easing ─────────────────────────────────────────────────── */
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ─── Stagger container ──────────────────────────────────────── */
const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.35 } },
};
const rowVariants = {
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE_EXPO } },
};

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="mt-16 space-y-px">
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-6 py-6 border-t border-black/8"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.15 }}
        >
          <div className="w-7 h-3 bg-neutral-200 shrink-0" />
          <div
            className="h-4 bg-neutral-200"
            style={{ width: `${120 + i * 40}px` }}
          />
          <div className="ml-auto w-20 h-3 bg-neutral-100" />
        </motion.div>
      ))}
    </div>
  );
}

/* ─── Category row — list layout ─────────────────────────────── */
function CategoryRow({
  category,
  index,
  lang,
  total,
}: {
  category: CategoryDto;
  index: number;
  lang: string;
  total: number;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const img = resolveMediaUrl(category.imageUrl);
  const name = pickLocalized(category.name, lang) || category.slug;
  const desc = pickLocalized(category.description, lang);

  return (
    <motion.article
      variants={rowVariants}
      className="group relative border-t border-black/10 cursor-pointer"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/shop?category=${encodeURIComponent(category.slug)}`)}
    >
      {/* Hover background fill — sweeps in from left */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none z-0"
        initial={false}
        animate={{ scaleX: hovered ? 1 : 0, originX: 0 }}
        transition={{ duration: 0.45, ease: EASE_EXPO }}
      />

      <div className="relative z-10 flex items-center gap-6 md:gap-10 py-5 md:py-6 px-0">

        {/* Index number */}
        <motion.span
          className="text-[10px] tabular-nums shrink-0 w-7 text-right"
          animate={{ color: hovered ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.25)" }}
          transition={{ duration: 0.3 }}
        >
          {String(index + 1).padStart(2, "0")}
        </motion.span>

        {/* Category name */}
        <motion.h2
          className="text-[clamp(1.1rem,2.8vw,2rem)] font-extralight leading-none tracking-[-0.01em] flex-1"
          animate={{
            color: hovered ? "#ffffff" : "#000000",
            letterSpacing: hovered ? "0.04em" : "-0.01em",
          }}
          transition={{ duration: 0.4, ease: EASE_EXPO }}
        >
          {name}
        </motion.h2>

        {/* Description — only visible on hover, desktop */}
        <AnimatePresence>
          {hovered && desc && (
            <motion.p
              key="desc"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 8 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="hidden md:block text-[10px] tracking-[0.1em] text-white/55 max-w-[200px] text-right leading-relaxed line-clamp-2 shrink-0"
            >
              {desc}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Thumbnail — peeks in on hover */}
        <div className="relative shrink-0 overflow-hidden"
          style={{ width: 64, height: 64 }}>
          <AnimatePresence>
            {hovered && img && (
              <motion.img
                key="thumb"
                src={img}
                alt={name}
                className="absolute inset-0 w-full h-full object-cover"
                initial={{ opacity: 0, scale: 1.1 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.35, ease: EASE_EXPO }}
                loading="lazy"
                decoding="async"
              />
            )}
          </AnimatePresence>
          {/* Placeholder outline when no image or not hovered */}
          <motion.div
            className="absolute inset-0 border"
            animate={{ borderColor: hovered ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0)" }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Arrow — morphs on hover */}
        <motion.div
          className="shrink-0 flex items-center"
          animate={{ x: hovered ? 4 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.span
            className="text-[11px] tracking-[0.2em] uppercase"
            animate={{ color: hovered ? "rgba(255,255,255,0.8)" : "rgba(0,0,0,0.2)" }}
            transition={{ duration: 0.3 }}
          >
            →
          </motion.span>
        </motion.div>
      </div>

      {/* Bottom rule — last item only */}
      {index === total - 1 && (
        <div className="absolute bottom-0 left-0 right-0 h-px bg-black/10" />
      )}
    </motion.article>
  );
}

/* ─── Featured card — large visual for first category ───────── */
function FeaturedCard({
  category,
  lang,
}: {
  category: CategoryDto;
  lang: String;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const img = resolveMediaUrl(category.imageUrl);
  const name = pickLocalized(category.name, lang) || category.slug;
  const desc = pickLocalized(category.description, lang);

  return (
    <motion.div
      className="relative overflow-hidden cursor-pointer mb-1"
      style={{ height: "clamp(280px, 40vw, 480px)" }}
      variants={rowVariants}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/shop?category=${encodeURIComponent(category.slug)}`)}
    >
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.9, ease: EASE_EXPO }}
      >
        {img ? (
          <MediaImage
            src={img}
            alt={name}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100" />
        )}
      </motion.div>

      {/* Gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/20 to-transparent pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.5 }}
      />

      {/* Text */}
      <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12">
        <p className="text-[9px] tracking-[0.35em] uppercase text-white/40 mb-3">
          Featured Category
        </p>
        <motion.h2
          className="text-white font-extralight leading-none mb-3"
          animate={{ fontSize: hovered ? "clamp(2rem,5vw,3.5rem)" : "clamp(1.7rem,4vw,2.8rem)" }}
          transition={{ duration: 0.45, ease: EASE_EXPO }}
          style={{ letterSpacing: "-0.02em" }}
        >
          {name}
        </motion.h2>
        <AnimatePresence>
          {hovered && desc && (
            <motion.p
              key="desc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="text-[11px] tracking-[0.06em] text-white/60 max-w-xs leading-relaxed mb-4"
            >
              {desc}
            </motion.p>
          )}
        </AnimatePresence>
        <motion.div className="flex items-center gap-3">
          <span className="text-[10px] tracking-[0.28em] uppercase text-white font-medium">
            Shop Now
          </span>
          <motion.div
            className="h-px bg-white/60"
            animate={{ width: hovered ? 44 : 20 }}
            transition={{ duration: 0.4, ease: EASE_EXPO }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function CategoriesPage() {
  const { lang, m } = useI18n();
  const [categories, setCategories] = useState<CategoryDto[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    CategoryApi.listPublic()
      .then((res) => { if (!cancelled) setCategories(res.categories ?? []); })
      .catch((e) => { if (!cancelled) setErr(getApiErrorMessage(e)); });
    return () => { cancelled = true; };
  }, []);

  const sorted = (categories ?? [])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const [featured, ...rest] = sorted;

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <motion.header
        className="px-6 md:px-12 pt-16 pb-8"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
      >
        <p className="text-[9px] tracking-[0.4em] uppercase text-black/30 mb-3">
          {new Date().getFullYear()} — {m.sections.categories?.title ?? "Categories"}
        </p>
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1
            className="text-[clamp(2.2rem,6vw,5rem)] font-extralight leading-none tracking-[-0.02em] text-black"
          >
            {m.sections.categories?.title ?? "Categories"}
          </h1>
          {sorted.length > 0 && (
            <p className="text-[10px] tracking-[0.22em] uppercase text-black/25 pb-2">
              {sorted.length} {sorted.length === 1 ? "Category" : "Categories"}
            </p>
          )}
        </div>
        <motion.div
          className="h-px bg-black mt-4"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_EXPO }}
        />
      </motion.header>

      {/* ── Body ── */}
      <main className="px-6 md:px-12 pb-24">

        {/* Loading */}
        {categories === null && !err && <Skeleton />}

        {/* Error */}
        {err && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-10 text-[11px] tracking-[0.15em] uppercase text-red-500"
          >
            {err}
          </motion.p>
        )}

        {/* Empty */}
        {categories !== null && !err && sorted.length === 0 && (
          <Empty
            variant="products"
            title={m.sections.categories?.empty ?? "No categories yet"}
            description={m.sections.categories?.emptyDescription}
            actionLabel={m.sections.categories?.browse}
            actionHref="/shop"
            className="mt-10"
          />
        )}

        {/* Content */}
        {sorted.length > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {/* Featured hero card — first category gets full width visual */}
            {featured && (
              <FeaturedCard category={featured} lang={lang} />
            )}

            {/* Remaining categories — editorial list rows */}
            {rest.map((c, i) => (
              <CategoryRow
                key={c.id}
                category={c}
                index={i + 1}
                lang={lang}
                total={rest.length}
              />
            ))}
          </motion.div>
        )}
      </main>
    </div>
  );
}
