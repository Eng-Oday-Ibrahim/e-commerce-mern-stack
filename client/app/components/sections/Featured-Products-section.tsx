"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ProductApi } from "@/lib/api/catalog/product";
import type { ProductDto } from "@/lib/api/catalog/types";
import { ProductCard } from "@/components/ui/Product-Card";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Button } from "../ui/Button";
import Empty from "@/components/ui/Empty";

const GOLD          = "#C9A84C";
const GOLD_GRADIENT = "linear-gradient(135deg,#8F6E22 0%,#C9A84C 55%,#E0C56F 100%)";
const EASE_EXPO     = [0.16, 1, 0.3, 1] as const;

/* ─── Skeleton ───────────────────────────────────────────────── */
function Skeleton() {
  return (
    <div className="grid grid-cols-2 xl:grid-cols-4 gap-px bg-black/5">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          className="bg-neutral-100"
          style={{ aspectRatio: "3/4" }}
          animate={{ opacity: [0.4, 0.75, 0.4] }}
          transition={{ duration: 1.7, repeat: Infinity, delay: i * 0.15 }}
        />
      ))}
    </div>
  );
}

export default function FeaturedProductsSection() {
  const { m } = useI18n();
  const [items, setItems] = useState<ProductDto[]>([]);

  useEffect(() => {
    let cancelled = false;
    ProductApi.listPublic()
      .then((res) => { if (!cancelled) setItems(res.products ?? []); })
      .catch(() => { if (!cancelled) setItems([]); });
    return () => { cancelled = true; };
  }, []);

  const visible = useMemo(
    () => [...items]
      .filter((p) => p.isFeatured && p.isActive !== false)
      .slice(0, 4),
    [items]
  );

  return (
    <section className="px-6 md:px-12 py-14">

      {/* ── Header ── */}
      <motion.div
        className="flex items-end justify-between mb-8"
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.65, ease: EASE_EXPO }}
      >
        <div>
          <p className="text-[9px] tracking-[0.38em] uppercase mb-2" style={{ color: GOLD }}>03</p>
          <h2 className="text-[clamp(1.4rem,4vw,2.8rem)] font-extralight leading-none tracking-[-0.01em] text-black">
            {m.home.featuredTitle}
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
          title={m.home.featuredEmpty}
          description={m.home.featuredEmptyDescription}
          actionLabel={m.home.browse}
          actionHref="/shop"
        />
      ) : (
        <motion.div
          className="grid grid-cols-2 xl:grid-cols-4 gap-1"
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          variants={{
            hidden: {},
            show: { transition: { staggerChildren: 0.08 } },
          }}
        >
          {visible.map((product, i) => (
            <motion.div
              key={product.id}
              className="bg-white"
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_EXPO } },
              }}
            >
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      )}

      <Button variant="ghost" className="">
        <Link href="/shop?featured=true"
          className="text-md tracking-[0.25em] uppercase text-deep-black/80 hover:text-black transition-colors duration-200 flex items-center gap-2 pb-1">
          {m.home.showMore}
          <motion.span whileHover={{ x: 3 }} transition={{ duration: 0.2 }}>→</motion.span>
        </Link>
        </Button>
    </section>
  );
}