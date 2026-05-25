"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CategoryApi } from "@/lib/api/catalog/category";
import type { CategoryDto } from "@/lib/api/catalog/types";
import { pickLocalized } from "@/lib/i18n/localize";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";
import Empty from "@/components/ui/Empty";

const GOLD          = "#C9A84C";
const GOLD_GRADIENT = "linear-gradient(135deg,#8F6E22 0%,#C9A84C 55%,#E0C56F 100%)";
const EASE_EXPO     = [0.16, 1, 0.3, 1] as const;

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-12 gap-px h-[420px] md:h-[520px]">
      {[
        "col-span-12 md:col-span-6 row-span-2",
        "col-span-12 md:col-span-6",
        "col-span-12 md:col-span-6",
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`${cls} bg-gray-50`}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/* ─── Single card ────────────────────────────────────────────── */
function CategoryCard({
  category, lang, large = false,
}: { category: CategoryDto; lang: string; large?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const name  = pickLocalized(category.name, lang) || category.slug;
  const image = resolveMediaUrl(category.imageUrl);

  return (
    <Link
      href={`/shop?category=${encodeURIComponent(category.slug)}`}
      className="relative overflow-hidden block h-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ minHeight: large ? 360 : 180 }}
    >
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.05 : 1 }}
        transition={{ duration: 0.8, ease: EASE_EXPO }}
      >
        {image ? (
          <MediaImage
            src={image}
            alt={name}
            fill
            sizes={large ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-50" />
        )}
      </motion.div>

      {/* Scrim */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-none"
        animate={{ opacity: hovered ? 0.45 : 0.25 }}
        transition={{ duration: 0.4 }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-5 md:p-7">

        {/* Name */}
        <motion.h3
          className="font-extralight leading-tight text-white"
          animate={{ fontSize: hovered ? (large ? "1.9rem" : "1.25rem") : (large ? "1.5rem" : "1rem") }}
          transition={{ duration: 0.4, ease: EASE_EXPO }}
          style={{ letterSpacing: large ? "-0.01em" : "0.06em" }}
        >
          {large ? name : <span className="tracking-[0.12em] uppercase text-sm">{name}</span>}
        </motion.h3>

        {/* CTA line */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.28, ease: EASE_EXPO }}
              className="flex items-center gap-3 mt-2"
            >
              <span className="text-[9px] tracking-[0.28em] uppercase font-medium" style={{ color: GOLD }}>
                Shop Now
              </span>
              <motion.div
                className="h-px"
                style={{ background: GOLD_GRADIENT }}
                initial={{ width: 0 }}
                animate={{ width: 30 }}
                transition={{ duration: 0.35, ease: EASE_EXPO }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom sweep line */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px] pointer-events-none"
        style={{ background: GOLD_GRADIENT }}
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.55, ease: EASE_EXPO }}
      />
    </Link>
  );
}

/* ─── Section ────────────────────────────────────────────────── */
export default function CategoriesSection() {
  const { lang, m } = useI18n();
  const [items, setItems] = useState<CategoryDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    CategoryApi.listPublic()
      .then((res) => { if (!cancelled) setItems(res.categories ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(
    () => [...items].filter((c) => c.isActive !== false)
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      .slice(0, 3),
    [items]
  );

  return (
    <section className="px-6 md:px-12 py-16">

      {/* ── Header ── */}
      <motion.div
        className="flex items-end justify-between mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: EASE_EXPO }}
      >
        <div>
          <p className="text-[9px] tracking-[0.38em] uppercase mb-2" style={{ color: GOLD }}>01</p>
          <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-extralight leading-none tracking-[-0.01em] text-black">
            {m.sections.categories.title}
          </h2>
        </div>
      </motion.div>

      {/* ── Animated rule ── */}
      <motion.div
        className="h-px mb-8"
        style={{ background: "rgba(0,0,0,0.08)" }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE_EXPO }}
      />

      {/* ── Grid ── */}
      {visible.length === 0 ? (
        <Empty
          variant="products"
          title={m.sections.categories.empty}
          description={m.sections.categories.emptyDescription}
          actionLabel={m.sections.categories.browse}
          actionHref="/shop"
        />
      ) : (
        <motion.div
          className="grid grid-cols-12 gap-1"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.1 }}
          style={{ minHeight: 460 }}
        >
          {/* Large card  left */}
          <div className="col-span-12 md:col-span-6 min-h-115">
            {visible[0] && <CategoryCard category={visible[0]} lang={lang} large />}
          </div>

          {/* Two stacked right */}
          <div className="col-span-12 md:col-span-6 grid grid-rows-2 gap-1 min-h-115">
            <div>
              {visible[1] && <CategoryCard category={visible[1]} lang={lang} />}
            </div>
            <div>
              {visible[2] && <CategoryCard category={visible[2]} lang={lang} />}
            </div>
          </div>
        </motion.div>
      )}
        <Link
          href="/categories"
          className="text-md m tracking-[0.25em] uppercase text-deep-black/80 hover:text-black transition-colors duration-200 flex items-center gap-2 pb-1"
        >
          {m.home.showMore}
          <motion.span
            className="inline-block"
            whileHover={{ x: 3 }}
            transition={{ duration: 0.2 }}
          >→</motion.span>
        </Link>
    </section>
  );
}
