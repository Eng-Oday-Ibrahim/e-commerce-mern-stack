"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";

const EASE = [0.22, 1, 0.36, 1] as const;

type FaqItem = { q: string; a: string };


/* ─── Single accordion row ───────────────────────────────────────────────── */
function FaqRow({
  item,
  index,
  isOpen,
  onToggle,
  isRtl,
}: {
  item: FaqItem;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  isRtl: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.7, ease: EASE, delay: index * 0.06 }}
      className="border-b border-neutral-100"
    >
      <button
        onClick={onToggle}
        className={`
          w-full flex items-start gap-6 py-6 text-left
          group transition-colors duration-200
          ${isRtl ? "flex-row-reverse text-right" : ""}
        `}
        aria-expanded={isOpen}
      >
        {/* Index */}
        <span
          className="shrink-0 text-[9px] tracking-[0.32em] uppercase text-neutral-300 mt-1 tabular-nums transition-colors duration-300 group-hover:text-neutral-500"
          aria-hidden
        >
          {String(index + 1).padStart(2, "0")}
        </span>

        {/* Question */}
        <span
          className={`
            flex-1 text-[15px] font-light leading-snug tracking-[-0.01em]
            text-neutral-700 group-hover:text-neutral-900
            transition-colors duration-300
            ${isOpen ? "text-neutral-900" : ""}
          `}
        >
          {item.q}
        </span>

        {/* Toggle icon */}
        <span
          className={`
            shrink-0 w-8 h-8 flex items-center justify-center
            border rounded-full mt-0.5
            transition-all duration-500
            ${isOpen
              ? "border-neutral-900 bg-neutral-900 text-white rotate-45"
              : "border-neutral-200 text-neutral-400 group-hover:border-neutral-500 group-hover:text-neutral-700"
            }
          `}
          aria-hidden
        >
          <svg
            width="10"
            height="10"
            viewBox="0 0 10 10"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          >
            <line x1="5" y1="1" x2="5" y2="9" />
            <line x1="1" y1="5" x2="9" y2="5" />
          </svg>
        </span>
      </button>

      {/* Answer */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.46, ease: EASE }}
            className="overflow-hidden"
          >
            <p
              className={`
                pb-7 text-sm leading-relaxed text-neutral-500 font-light
                ${isRtl ? "pr-14 pl-12 text-right" : "pl-14 pr-12"}
              `}
            >
              {item.a}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Section ────────────────────────────────────────────────────────────── */
export default function FaqSection() {
  const { lang, m } = useI18n();
  const isRtl = lang === "ar";
 
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (i: number) => setOpenIndex((prev) => (prev === i ? null : i));

  return (
    <section className="py-24">
      {/* Header — mirrors lookbook header */}
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-15%" }}
        transition={{ duration: 1.1, ease: EASE }}
        className={`
          px-6 md:px-16 mb-14
          flex items-end justify-between
        `}
      >
        <div>
          <p className="text-[9px] tracking-[0.42em] uppercase text-neutral-400 mb-4">
            {m.sections.faq.label}
          </p>
          <h2 className="text-[clamp(2.2rem,4.5vw,4rem)] font-light leading-[1.02] tracking-[-0.03em] text-neutral-900">
            {m.sections.faq.title}
          </h2>
        </div>

        {/* Item count badge */}
        <span className="hidden md:inline-flex items-center gap-1.5 text-[10px] tracking-[0.26em] uppercase text-neutral-400">
          {m.sections.faq.items.length}
          <span className="text-neutral-200">—</span>
          {isRtl ? "سؤال" : "questions"}
        </span>
      </motion.div>

      {/* Accordion */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-8%" }}
        transition={{ duration: 1, ease: EASE }}
        className="px-6 md:px-16"
      >
        {/* Top border */}
        <div className="border-t border-neutral-100">
          {m.sections.faq.items.map((item, i) => (
            <FaqRow
              key={i}
              item={item}
              index={i}
              isOpen={openIndex === i}
              onToggle={() => toggle(i)}
              isRtl={isRtl}
            />
          ))}
        </div>
      </motion.div>
    </section>
  );
}