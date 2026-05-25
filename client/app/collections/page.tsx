"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { CollectionApi } from "@/lib/api/catalog/collection";
import type { CollectionDto } from "@/lib/api/catalog/types";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";
import MediaImage from "@/components/ui/MediaImage";
import Empty from "@/components/ui/Empty";

/* ─── Animation presets ──────────────────────────────────────── */
const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

const containerVariants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE_EXPO },
  },
};

/* ─── Editorial grid layout patterns ────────────────────────────
   Cycles through layout "recipes" to create visual rhythm.
   Each recipe is [colSpan, rowSpan] in a 12-col / auto-row grid.
─────────────────────────────────────────────────────────────── */
const LAYOUTS: Array<[string, string][]> = [
  // Recipe A — hero left + two stacked right
  [
    ["col-span-12 md:col-span-7", "md:row-span-2"],
    ["col-span-12 md:col-span-5", ""],
    ["col-span-12 md:col-span-5", ""],
  ],
  // Recipe B — two tall left + hero right
  [
    ["col-span-12 md:col-span-5", ""],
    ["col-span-12 md:col-span-5", ""],
    ["col-span-12 md:col-span-7", "md:row-span-2"],
  ],
  // Recipe C — three equal
  [
    ["col-span-12 md:col-span-4", ""],
    ["col-span-12 md:col-span-4", ""],
    ["col-span-12 md:col-span-4", ""],
  ],
  // Recipe D — wide top + two bottom
  [
    ["col-span-12", ""],
    ["col-span-12 md:col-span-6", ""],
    ["col-span-12 md:col-span-6", ""],
  ],
];

function getLayout(index: number): [string, string] {
  const recipeIndex = Math.floor(index / 3) % LAYOUTS.length;
  const posIndex = index % 3;
  return LAYOUTS[recipeIndex][posIndex] ?? ["col-span-12 md:col-span-6", ""];
}

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-12 gap-1 mt-16">
      {[
        "col-span-12 md:col-span-7 h-[540px]",
        "col-span-12 md:col-span-5 h-64",
        "col-span-12 md:col-span-5 h-64",
        "col-span-12 md:col-span-6 h-80",
        "col-span-12 md:col-span-6 h-80",
      ].map((cls, i) => (
        <motion.div
          key={i}
          className={`${cls} bg-neutral-100 overflow-hidden`}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.4, 0.8, 0.4] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.12 }}
        />
      ))}
    </div>
  );
}

/* ─── Single collection card ─────────────────────────────────── */
function CollectionCard({
  collection,
  colSpan,
  rowSpan,
  index,
  lang,
}: {
  collection: CollectionDto;
  colSpan: string;
  rowSpan: string;
  index: number;
  lang: string;
}) {
  const router = useRouter();
  const [hovered, setHovered] = useState(false);
  const img = resolveMediaUrl(collection.imageUrl);
  const name = pickLocalized(collection.name, lang) || collection.slug;
  const desc = pickLocalized(collection.description, lang);

  // Determine aspect ratio by card size
  const isHero = colSpan.includes("col-span-7") || colSpan.includes("col-span-12 md:col-span-12") || rowSpan.includes("row-span-2");
  const isWide = colSpan === "col-span-12";

  return (
    <motion.article
      variants={itemVariants}
      className={`${colSpan} ${rowSpan} relative overflow-hidden cursor-pointer group`}
      style={{
        minHeight: isHero ? 520 : isWide ? 400 : 340,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => router.push(`/shop?collection=${encodeURIComponent(collection.slug)}`)}
    >
      {/* ── Background image with parallax-like zoom ── */}
      <motion.div
        className="absolute inset-0 w-full h-full"
        animate={{ scale: hovered ? 1.06 : 1 }}
        transition={{ duration: 0.9, ease: EASE_EXPO }}
      >
        {img ? (
          <MediaImage
            src={img}
            alt={name}
            fill
            sizes={isHero ? "(max-width: 768px) 100vw, 60vw" : isWide ? "(max-width: 768px) 100vw, 45vw" : "(max-width: 768px) 100vw, 33vw"}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
            <span className="text-[10px] tracking-[0.3em] uppercase text-neutral-300">
              No Image
            </span>
          </div>
        )}
      </motion.div>

      {/* ── Gradient scrim — always subtle, deepens on hover ── */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none"
        animate={{ opacity: hovered ? 1 : 0.75 }}
        transition={{ duration: 0.5 }}
      />

      {/* ── Index number — editorial accent ── */}
      <div className="absolute top-5 left-5 z-10">
        <span className="text-[10px] tracking-[0.3em] text-white/40 font-light tabular-nums">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* ── Content block — bottom ── */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-6 md:p-8 flex flex-col gap-2">

        {/* Collection name */}
        <motion.h2
          className="text-white font-light leading-tight"
          animate={{
            fontSize: hovered ? (isHero ? "2rem" : "1.35rem") : (isHero ? "1.6rem" : "1.1rem"),
          }}
          transition={{ duration: 0.45, ease: EASE_EXPO }}
          style={{ letterSpacing: "0.06em" }}
        >
          {name}
        </motion.h2>

        {/* Description — slides up on hover */}
        <AnimatePresence>
          {hovered && desc && (
            <motion.p
              key="desc"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.3, ease: EASE_EXPO }}
              className="text-[11px] tracking-[0.08em] text-white/65 leading-relaxed max-w-sm line-clamp-2"
            >
              {desc}
            </motion.p>
          )}
        </AnimatePresence>

        {/* CTA — slides up on hover */}
        <AnimatePresence>
          {hovered && (
            <motion.div
              key="cta"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 8 }}
              transition={{ duration: 0.3, delay: 0.05, ease: EASE_EXPO }}
              className="flex items-center gap-3 mt-1"
            >
              <span className="text-[10px] tracking-[0.28em] uppercase text-white font-medium">
                Explore
              </span>
              <motion.div
                className="h-px bg-white/70 flex-shrink-0"
                initial={{ width: 0 }}
                animate={{ width: 36 }}
                exit={{ width: 0 }}
                transition={{ duration: 0.35, ease: EASE_EXPO }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Corner accent line — Zara editorial detail ── */}
      <motion.div
        className="absolute bottom-0 left-0 h-px bg-white/30 pointer-events-none"
        animate={{ width: hovered ? "100%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE_EXPO }}
      />
    </motion.article>
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
export default function CollectionsPage() {
  const { lang, m } = useI18n();
  const [collections, setCollections] = useState<CollectionDto[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    CollectionApi.listPublic()
      .then((res) => { if (!cancelled) setCollections(res.collections ?? []); })
      .catch((e) => { if (!cancelled) setErr(getApiErrorMessage(e)); });
    return () => { cancelled = true; };
  }, []);

  const sorted = (collections ?? [])
    .filter((c) => c.isActive !== false)
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return (
    <div className="min-h-screen">

      {/* ── Page header ── */}
      <motion.header
        className="px-6 md:px-12 pt-16 pb-8 flex flex-col gap-3"
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: EASE_EXPO }}
      >
        {/* Eyebrow */}
        <p className="text-[9px] tracking-[0.4em] uppercase text-black/35">
          {new Date().getFullYear()} — {m.sections.collections?.title ?? "Collections"}
        </p>

        {/* Big editorial headline */}
        <div className="flex items-end justify-between gap-6 flex-wrap">
          <h1
            className="text-[clamp(2.2rem,6vw,5rem)] font-extralight leading-none tracking-[-0.02em] text-black"
          >
            {m.sections.collections?.title ?? "Collections"}
          </h1>
          {sorted.length > 0 && (
            <p className="text-[10px] tracking-[0.22em] uppercase text-black/30 pb-2">
              {sorted.length} {sorted.length === 1 ? "Collection" : "Collections"}
            </p>
          )}
        </div>

        {/* Thin rule */}
        <motion.div
          className="h-px bg-black mt-2"
          initial={{ scaleX: 0, originX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.2, ease: EASE_EXPO }}
        />
      </motion.header>

      {/* ── Body ── */}
      <main className="px-6 md:px-12 pb-24">

        {/* Loading */}
        {collections === null && !err && <Skeleton />}

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
        {collections !== null && !err && sorted.length === 0 && (
          <Empty
            variant="products"
            title={m.sections.collections?.empty ?? "No collections yet"}
            description={m.sections.collections?.emptyDescription}
            actionLabel={m.sections.collections?.browse}
            actionHref="/shop"
          />
        )}

        {/* Editorial grid */}
        {sorted.length > 0 && (
          <motion.div
            className="grid grid-cols-12 gap-1"
            variants={containerVariants}
            initial="hidden"
            animate="show"
          >
            {sorted.map((c, i) => {
              const [colSpan, rowSpan] = getLayout(i);
              return (
                <CollectionCard
                  key={c.id}
                  collection={c}
                  colSpan={colSpan}
                  rowSpan={rowSpan}
                  index={i}
                  lang={lang}
                />
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
