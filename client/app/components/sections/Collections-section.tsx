"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CollectionApi } from "@/lib/api/catalog/collection";
import type { CollectionDto } from "@/lib/api/catalog/types";
import { pickLocalized } from "@/lib/i18n/localize";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";
import Empty from "@/components/ui/Empty";

const GOLD          = "#C9A84C";
const GOLD_LIGHT    = "#E0C56F";
const GOLD_GRADIENT = "linear-gradient(135deg,#8F6E22 0%,#C9A84C 55%,#E0C56F 100%)";
const EASE_EXPO     = [0.16, 1, 0.3, 1] as const;

function Skeleton() {
  return (
    <div className="flex gap-px overflow-hidden h-[480px]">
      {[40, 35, 25].map((w, i) => (
        <motion.div
          key={i}
          className="bg-neutral-100 shrink-0"
          style={{ width: `${w}%` }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

function CollectionCard({
  collection, index, lang, wide = false,
}: { collection: CollectionDto; index: number; lang: string; wide?: boolean }) {
  const [hovered, setHovered] = useState(false);
  const name  = pickLocalized(collection.name, lang)  || collection.slug;
  const desc  = pickLocalized(collection.description, lang);
  const image = resolveMediaUrl(collection.imageUrl);

  return (
    <Link
      href={`/shop?collection=${encodeURIComponent(collection.slug)}`}
      className="relative overflow-hidden block h-full"
      style={{ minHeight: 380 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <motion.div
        className="absolute inset-0"
        animate={{ scale: hovered ? 1.07 : 1 }}
        transition={{ duration: 0.9, ease: EASE_EXPO }}
      >
        {image
          ? (
            <MediaImage
              src={image}
              alt={name}
              fill
              sizes={wide ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
              className="object-cover"
            />
          )
          : <div className="w-full h-full bg-gray-50" />
        }
      </motion.div>

      {/* Gradient scrim */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.08) 60%)" }}
        animate={{ opacity: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.4 }}
      />

      {/* Index number — top left */}
      <div className="absolute top-5 left-5 z-10">
        <span className="text-[10px] tracking-[0.3em] tabular-nums font-light" style={{ color: "rgba(255,255,255,0.3)" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* Content — bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7 z-10">

        <motion.h3
          className="text-white font-extralight leading-tight"
          animate={{
            fontSize: hovered
              ? (wide ? "2rem" : "1.4rem")
              : (wide ? "1.6rem" : "1.1rem"),
            letterSpacing: hovered ? "-0.01em" : "0.03em",
          }}
          transition={{ duration: 0.4, ease: EASE_EXPO }}
        >
          {name}
        </motion.h3>

        <AnimatePresence>
          {hovered && (
            <motion.div
              key="info"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
            >
              {desc && (
                <p className="text-[10px] tracking-[0.06em] mt-2 line-clamp-2 leading-relaxed" style={{ color: "rgba(255,255,255,0.5)" }}>
                  {desc}
                </p>
              )}
              <div className="flex items-center gap-3 mt-3">
                <span className="text-[9px] tracking-[0.3em] uppercase font-medium" style={{ color: GOLD }}>
                  Explore
                </span>
                <motion.div
                  className="h-px"
                  style={{ background: GOLD_GRADIENT }}
                  initial={{ width: 0 }}
                  animate={{ width: 36 }}
                  transition={{ duration: 0.4, ease: EASE_EXPO }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Gold left border on hover */}
      <motion.div
        className="absolute left-0 top-0 w-[2px] pointer-events-none"
        style={{ background: GOLD_GRADIENT }}
        animate={{ height: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE_EXPO }}
      />
    </Link>
  );
}

export default function CollectionsSection() {
  const { lang, m } = useI18n();
  const [items, setItems] = useState<CollectionDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    CollectionApi.listPublic()
      .then((res) => { if (!cancelled) setItems(res.collections ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(
    () => [...items]
      .filter((c) => c.isActive !== false)
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
          <p className="text-[9px] tracking-[0.38em] uppercase mb-2" style={{ color: GOLD }}>02</p>
          <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-extralight leading-none tracking-[-0.01em] text-black">
            {m.sections.collections.title}
          </h2>
        </div>
      </motion.div>

      <motion.div
        className="h-px mb-8"
        style={{ background: "rgba(0,0,0,0.08)" }}
        initial={{ scaleX: 0, originX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: EASE_EXPO }}
      />

      {/* ── Asymmetric 3-column grid ── */}
      {visible.length === 0 ? (
        <Empty
          variant="products"
          title={m.sections.collections.empty}
          description={m.sections.collections.emptyDescription}
          actionLabel={m.sections.collections.browse}
          actionHref="/shop"
        />
      ) : (
        <motion.div
          className="grid gap-1"
          style={{ gridTemplateColumns: "5fr 4fr 3fr", minHeight: 480 }}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.1 }}
        >
          {visible.map((c, i) => (
            <div key={c.id} className="bg-gray-50">
              <CollectionCard collection={c} index={i} lang={lang} wide={i === 0} />
            </div>
          ))}
        </motion.div>
      )}
              <Link
          href="/collections"
          className="text-md tracking-[0.25em] uppercase text-deep-black/80 hover:text-black transition-colors duration-200 flex items-center gap-2 pb-1"
        >
          {m.home.showMore}
          <motion.span whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>→</motion.span>
        </Link>
    </section>
  );
}
