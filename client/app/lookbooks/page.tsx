/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingApi, type LookbookDto } from "@/lib/api/marketing";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Lang } from "@/lib/i18n/lang";
import { pickLocalized } from "@/lib/i18n/localize";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import MediaImage from "@/components/ui/MediaImage";
import Empty from "@/components/ui/Empty";

const EASE = [0.22, 1, 0.36, 1] as const;

/* ─── Full-card product takeover ─────────────────────────────────────────── */
function ProductTakeover({
  lookbook,
  lang,
}: {
  lookbook: LookbookDto;
  lang: Lang;
}) {
  const products = (lookbook.products ?? []).slice(0, 4);
  if (products.length === 0) return null;

  const cols = products.length <= 2 ? products.length : 2;
  const rows = products.length <= 2 ? 1 : 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="absolute inset-0 z-20 flex flex-col"
    >
      <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 shrink-0">
        <span className="text-[9px] tracking-[0.38em] uppercase text-neutral-400">
          Shop the look
        </span>
        <span className="text-[9px] tracking-[0.18em] uppercase text-neutral-300">
          {products.length} pieces
        </span>
      </div>

      <div
        className="flex-1 min-h-0"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: "4px",
          background: "#e5e5e5",
        }}
      >
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/shop/${product.slug}`}
            onClick={(e) => e.stopPropagation()}
            className="group/p relative overflow-hidden bg-neutral-50 block"
          >
            <MediaImage
              src={resolveMediaUrl(product.images?.[0])}
              alt={pickLocalized(product.name, lang) || product.slug}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 group-hover/p:scale-[1.06]"
            />
            <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-white/92 backdrop-blur-[2px]">
              <p className="text-[9px] tracking-[0.1em] uppercase text-neutral-700 line-clamp-1 leading-none">
                {pickLocalized(product.name, lang) || product.slug}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Hero lookbook card ─────────────────────────────────────────────────── */
function HeroCard({ lookbook, lang }: { lookbook: LookbookDto; lang: Lang }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1.2, ease: EASE }}
      className="relative overflow-hidden cursor-pointer"
      style={{ minHeight: "600px" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <MediaImage
        src={resolveMediaUrl(lookbook.coverImage) || ""}
        alt={pickLocalized(lookbook.title, lang) || lookbook.slug}
        fill
        sizes="(max-width: 768px) 100vw, 70vw"
        className="object-cover"
        style={{
          transform: hovered ? "scale(1.04)" : "scale(1)",
          transition: "transform 1.4s cubic-bezier(0.22,1,0.36,1)",
        }}
        loading="eager"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />

      {/* Featured badge */}
      <div className="absolute top-8 left-8 z-10">
        <span className="text-[9px] tracking-[0.42em] uppercase text-white/55 border border-white/18 px-3.5 py-2">
          Featured Edit
        </span>
      </div>

      {/* Number */}
      <span className="absolute top-8 right-8 z-10 text-[9px] tracking-[0.3em] uppercase text-white/30">
        01
      </span>

      {/* Content */}
      <AnimatePresence>
        {!hovered && (
          <motion.div
            key="hero-info"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.28 }}
            className="absolute bottom-0 inset-x-0 p-10 z-10"
          >
            <h2
              className="text-white font-light leading-[1.06] tracking-[-0.03em] mb-3"
              style={{
                fontSize: "clamp(2rem, 3.5vw, 3.8rem)",
              }}
            >
              {pickLocalized(lookbook.title, lang) || lookbook.slug}
            </h2>
            <p className="text-white/48 text-sm leading-relaxed max-w-lg line-clamp-2">
              {pickLocalized(lookbook.description, lang)}
            </p>
            <p className="mt-8 text-[9px] tracking-[0.32em] uppercase text-white/35">
              Hover to shop ·{" "}
              {(lookbook.products ?? []).length > 0
                ? `${(lookbook.products ?? []).length} pieces`
                : ""}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && <ProductTakeover lookbook={lookbook} lang={lang} />}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Bento grid card (variable sizes) ───────────────────────────────────── */
function BentoCard({
  lookbook,
  lang,
  index,
  tall,
}: {
  lookbook: LookbookDto;
  lang: Lang;
  index: number;
  tall?: boolean;
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative overflow-hidden cursor-pointer"
      style={{ gridRow: tall ? "span 2" : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MediaImage
        src={resolveMediaUrl(lookbook.coverImage) || ""}
        alt={pickLocalized(lookbook.title, lang) || lookbook.slug}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className="object-cover"
        style={{
          transform: hovered ? "scale(1.05)" : "scale(1)",
          transition: "transform 1.25s cubic-bezier(0.22,1,0.36,1)",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/5 to-transparent" />

      <span className="absolute top-5 left-5 z-10 text-[9px] tracking-[0.3em] uppercase text-white/35">
        {String(index + 2).padStart(2, "0")}
      </span>

      <AnimatePresence>
        {!hovered && (
          <motion.div
            key="bento-info"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="absolute bottom-0 inset-x-0 p-6 z-10"
          >
            <h3
              className="text-white font-light leading-snug tracking-[-0.015em] line-clamp-2"
              style={{
                fontSize: tall ? "1.5rem" : "1.1rem",
              }}
            >
              {pickLocalized(lookbook.title, lang) || lookbook.slug}
            </h3>
            {tall && (
              <p className="mt-2 text-white/42 text-xs leading-relaxed line-clamp-2">
                {pickLocalized(lookbook.description, lang)}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {hovered && <ProductTakeover lookbook={lookbook} lang={lang} />}
      </AnimatePresence>
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function LookbooksIndexPage() {
  const { lang, m } = useI18n();
  const [loading, setLoading] = useState(true);
  const [lookbooks, setLookbooks] = useState<LookbookDto[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await MarketingApi.lookbooksListPublic();
        setLookbooks(res.lookbooks ?? []);
      } catch (e) {
        Toast.error(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = useMemo(() => lookbooks[0], [lookbooks]);
  const rest = useMemo(() => lookbooks.slice(1), [lookbooks]);

  return (
    <div className="min-h-screen">
      {/* ── Page header ── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE }}
        className="px-6 md:px-16 pt-20 pb-16 border-b border-neutral-100"
      >
        <p className="text-[9px] tracking-[0.44em] uppercase text-neutral-400 mb-5">
          {m.sections.lookbooks.subtitle}
        </p>
        <div className="flex items-end justify-between gap-8">
          <h1
            className="text-[clamp(2.6rem,6vw,5.5rem)] font-light leading-[1.02] tracking-[-0.03em] text-neutral-900"
          >
            {m.sections.lookbooks.title}
          </h1>
          <p className="hidden md:block text-[11px] text-neutral-400 max-w-[200px] text-right leading-[1.9] pb-2 tracking-[0.02em]">
            {m.sections.lookbooks.subtitle}
          </p>
        </div>
      </motion.div>

      {/* ── Body ── */}
      <div className="px-6 md:px-16 py-16">
        {loading ? (
          <div className="space-y-1 animate-pulse">
            <div className="h-[600px] bg-neutral-100" />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gridTemplateRows: "280px 280px",
                gap: "4px",
                background: "#e5e5e5",
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-neutral-100" />
              ))}
            </div>
          </div>
        ) : lookbooks.length === 0 ? (
          <Empty
            variant="products"
            title={m.sections.lookbooks?.empty ?? "No published lookbooks yet."}
            description={m.sections.lookbooks?.emptyDescription}
            actionLabel={m.sections.lookbooks?.browse}
            actionHref="/shop"
          />
        ) : (
          <div className="space-y-0.5">
            {/* Hero */}
            {featured && <HeroCard lookbook={featured} lang={lang} />}

            {/* Divider */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
                className="flex items-center gap-6 py-12"
              >
                <span className="text-[9px] tracking-[0.38em] uppercase text-neutral-300">
                  {m.sections.lookbooks.all}
                </span>
                <span className="flex-1 h-px bg-neutral-100" />
                <span className="text-[9px] tracking-[0.2em] uppercase text-neutral-300">
                  {rest.length} {rest.length === 1 ? m.sections.lookbooks.all.split(" ")[0] : m.sections.lookbooks.all.split(" ")[0].toLowerCase()}
                </span>
              </motion.div>
            )}

            {/* 
              Bento grid: 3 columns.
              Alternating pattern: tall (spans 2 rows) + 4 standard = every 5 items
              Tall card at positions 0, 5, 10…
            */}
            {rest.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, ease: EASE, delay: 0.2 }}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 1fr",
                  gridAutoRows: "280px",
                  gap: "4px",
                }}
              >
                {rest.map((l, idx) => {
                  // Every 5-item group: pos 0 = tall (left col, spans 2 rows)
                  const groupPos = idx % 5;
                  const isTall = groupPos === 0;

                  return (
                    <BentoCard
                      key={l.slug}
                      lookbook={l}
                      lang={lang}
                      index={idx}
                      tall={isTall}
                    />
                  );
                })}
              </motion.div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
