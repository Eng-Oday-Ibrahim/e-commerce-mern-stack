"use client";

import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

export type PolicySection = {
  heading: string;
  body: string;
};

export type PolicyPageData = {
  label: string;
  title: string;
  lastUpdated: string;
  sections: PolicySection[];
};

interface PolicyPageLayoutProps {
  data: PolicyPageData;
  isRtl?: boolean;
}

/* ─── Shared editorial policy layout ───────────────────────────────────────
   Design direction: Zara-style — pure white, extreme whitespace, stark
   typographic hierarchy, ultra-light weight, zero decoration, content is
   the only visual. One unforgettable detail: the section number floats
   left as a full-height vertical rule that stretches as content grows.
──────────────────────────────────────────────────────────────────────────── */
export default function PolicyPageLayout({
  data,
}: PolicyPageLayoutProps) {
  return (
    <main
      className="min-h-screen bg-gray-50">
      {/* ── Hero header ── */}
      <header className="px-6 md:px-16 lg:px-24 pt-28 pb-20 border-b border-neutral-100">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: EASE }}
          className="text-[9px] tracking-[0.48em] uppercase text-neutral-400 mb-8">
          {data.label}
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: EASE, delay: 0.08 }}
          className="font-light leading-[0.96] tracking-[-0.04em] text-neutral-900 mb-10"
          style={{ fontSize: "clamp(3rem, 7vw, 6.5rem)" }}
        >
          {data.title}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.22 }}
          className="text-[10px] tracking-[0.22em] uppercase text-neutral-300">
          {data.lastUpdated}
        </motion.p>
      </header>

      {/* ── Sections ── */}
      <div className="px-6 md:px-16 lg:px-24 py-20 space-y-0">
        {data.sections.map((section, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-6%" }}
            transition={{ duration: 0.8, ease: EASE, delay: i * 0.05 }}
            className={`
              flex gap-12 md:gap-20 py-14 border-b border-gray-100`}
          >
            {/* Section number + rule */}
            <div className={`shrink-0 flex flex-col items-center`}>
              <span
                className="text-[9px] tracking-[0.3em] text-neutral-300 tabular-nums mb-3" aria-hidden >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 w-px bg-gray-50" style={{ minHeight: 40 }} />
            </div>

            {/* Content */}
            <div className={`flex-1 max-w-2xl`}>
              <h2
                className="font-light leading-snug tracking-[-0.02em] text-neutral-900 mb-5"
                style={{
                  fontSize: "clamp(1.15rem, 1.8vw, 1.5rem)"
                }}
              >
                {section.heading}
              </h2>
              <p
                className="text-neutral-500 leading-[1.85] font-light"
                style={{
                  fontSize: "clamp(0.875rem, 1vw, 1rem)",
                  fontWeight: 300,
                }}
              >
                {section.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>
    </main>
  );
}