"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { MarketingApi, type LookbookDto } from "@/lib/api/marketing";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import Empty from "@/components/ui/Empty";

/* ─── Product Overlay ───────────────────────── */
function ProductOverlay({ product, lang }: { product: any; lang: string }) {
  if (!product) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-20 pointer-events-none"
    >
      <Link
        href={`/shop/${product.slug}`}
        className="block w-full h-full pointer-events-auto"
      >
        <img
          src={resolveMediaUrl(product.images?.[0])}
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/40 pointer-events-none" />

        <div className="absolute bottom-0 p-5 text-white pointer-events-none">
          <p className="text-xs tracking-[0.3em] uppercase mb-2">
            Shop Now
          </p>
          <h3 className="text-lg font-light">
            {product.name?.[lang] || product.slug}
          </h3>
        </div>
      </Link>
    </motion.div>
  );
}

/* ─── Card ───────────────────────── */
function LookbookCard({
  lookbook,
  lang,
}: {
  lookbook: LookbookDto;
  lang: string;
}) {
  const [hovered, setHovered] = useState(false);
  const product = lookbook.products?.[0];

  return (
    <div
      className="relative w-[280px] md:w-[360px] h-[420px] md:h-[520px] shrink-0 overflow-hidden group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <img
        src={resolveMediaUrl(lookbook.coverImage)}
        className="w-full h-full object-cover transition duration-700 group-hover:scale-105 pointer-events-none"
      />

      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      <div className="absolute bottom-0 p-5 z-10 text-white pointer-events-none">
        <h3 className="text-lg md:text-xl font-light">
          {lookbook.title?.[lang] || lookbook.slug}
        </h3>
      </div>

      <AnimatePresence>
        {hovered && product && (
          <ProductOverlay product={product} lang={lang} />
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── MAIN ───────────────────────── */
export default function CatalogSection() {
  const { lang, m } = useI18n();

  const [items, setItems] = useState<LookbookDto[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await MarketingApi.lookbooksListPublic();
        setItems(res.lookbooks ?? []);
      } catch (e) {
        Toast.error(getApiErrorMessage(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ─── Scroll Buttons ───────────────────────── */
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;

    const amount = 300; // تتحكم في المسافة
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  if (loading) {
    return (
      <section className="py-20 px-6">
        <div className="h-[400px] bg-neutral-100 animate-pulse" />
      </section>
    );
  }

  if (!items.length) {
    return (
      <section className="py-20 px-6">
        <Empty
          variant="products"
          title={m.sections.lookbooks?.empty}
          description={m.sections.lookbooks?.emptyDescription}
          actionLabel={m.sections.lookbooks?.browse}
          actionHref="/shop"
        />
      </section>
    );
  }

  return (
    <section className="py-20 relative">
      {/* Header */}
      <div className="px-6 md:px-16 mb-10">
        <h2 className="text-3xl md:text-5xl font-light">
          Shop the Looks
        </h2>
      </div>

      {/* Buttons */}
      <button
        onClick={() => scroll("left")}
        className="absolute left-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white px-4 py-2 shadow"
      >
        {"<"}
      </button>

      <button
        onClick={() => scroll("right")}
        className="absolute right-2 top-1/2 -translate-y-1/2 z-30 bg-white/80 hover:bg-white px-4 py-2 shadow"
      >
        {">"}
      </button>

      {/* Carousel */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto px-10 md:px-20 snap-x snap-mandatory scroll-smooth"
      >
        {items.map((item) => (
          <div key={item.id} className="snap-start">
            <LookbookCard lookbook={item} lang={lang} />
          </div>
        ))}
      </div>
    </section>
  );
}