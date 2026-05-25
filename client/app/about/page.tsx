"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.9, ease: EASE } },
};

export default function AboutPage() {
  const { m, lang } = useI18n();
  const a = m.pages.about;

  const values = [
    { num: "01", title: a.v1Title, desc: a.v1Desc },
    { num: "02", title: a.v2Title, desc: a.v2Desc },
    { num: "03", title: a.v3Title, desc: a.v3Desc },
    { num: "04", title: a.v4Title, desc: a.v4Desc },
    { num: "05", title: a.v5Title, desc: a.v5Desc },
    { num: "06", title: a.v6Title, desc: a.v6Desc },
  ];

  const products = [
    { src: "images/about-line-1.jpg", label: a.p1Label },
    { src: "images/about-line-2.jpg", label: a.p2Label },
    { src: "images/about-line-3.jpg", label: a.p3Label },
    { src: "images/about-line-4.jpg", label: a.p4Label },
  ];

  return (
    <PageEnter>
      <div className="bg-white text-neutral-900 overflow-x-hidden">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative min-h-svh grid grid-cols-1 md:grid-cols-2">

          {/* Image side */}
          <div className="relative overflow-hidden min-h-[55vw] md:min-h-0">
            <img
              src="images/about-1.jpg"
              alt="Hero"
              className="absolute inset-0 w-full h-full object-cover brightness-90 scale-105"
            />
          </div>

          {/* Text side */}
          <div className="relative flex flex-col justify-end bg-neutral-900 px-8 py-16 md:px-[6vw] md:py-[6vw]">
            {/* giant ghost number */}
            <span
              className="absolute top-[6vw] end-[6vw] text-[10rem] md:text-[14rem] font-light leading-none text-white/[0.04] select-none pointer-events-none tabular-nums"
              aria-hidden
            >
              01
            </span>

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative z-10"
            >
              <motion.p variants={fadeUp} className="text-[9px] tracking-[0.42em] uppercase text-neutral-500 mb-8">
                {a.heroEyebrow}
              </motion.p>
              <motion.h1
                variants={fadeUp}
                className="text-[clamp(3rem,6vw,5.5rem)] font-light leading-[1.0] tracking-[-0.03em] text-white mb-8"
              >
                {a.heroTitle1}{" "}
                <span className="italic text-gold">{a.heroTitle2}</span>
                <br />
                {a.heroTitle3}
              </motion.h1>
              <motion.div variants={fadeUp} className="w-10 h-px bg-neutral-600 mb-7" />
              <motion.p variants={fadeUp} className="text-xs font-light leading-[1.9] tracking-[0.06em] text-neutral-500 max-w-xs">
                {a.heroSubtitle}
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* ── PHILOSOPHY ───────────────────────────────────────────────────── */}
        <FadeInSection>
          <section className="flex flex-col md:flex-row bg-neutral-900">

            {/* Image — LTR: left, RTL: right via order */}
            <div className="relative w-full md:w-[38%] aspect-[4/5] shrink-0 order-last md:order-first [dir=rtl]:order-last [dir=rtl]:md:order-last">
              <img
                src="images/about-2.jpg"
                alt="Philosophy"
                className="absolute inset-0 w-full h-full object-cover brightness-75"
              />
            </div>

            {/* Text */}
            <div className="flex-1 px-8 py-16 md:px-[6vw] md:py-[7vw]">
              <p className="flex items-center gap-4 text-[9px] tracking-[0.42em] uppercase text-neutral-500 mb-10">
                {a.philosophyLabel}
                <span className="block w-7 h-px bg-neutral-600" />
              </p>
              <h2 className="text-[clamp(1.8rem,3vw,2.8rem)] font-light leading-[1.25] tracking-[-0.025em] text-white mb-8">
                {a.philosophyHeading1}
                <br />
                <span className="italic text-gold">{a.philosophyHeadingEm}</span>{" "}
                {a.philosophyHeading2}
              </h2>
              <p className="text-[13px] font-light leading-[2] text-neutral-500 max-w-lg">
                {a.philosophyBody}
              </p>
            </div>
          </section>
        </FadeInSection>

        {/* ── VALUES ───────────────────────────────────────────────────────── */}
        <FadeInSection>
          <section className="px-6 py-20 md:px-16 md:py-28 lg:px-24 lg:py-32 bg-white">

            {/* Header row */}
            <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-16 mb-16 md:mb-20 items-end">
              <h2 className="text-[clamp(2rem,3.5vw,3.5rem)] font-light leading-[1.08] tracking-[-0.03em] text-neutral-900">
                {a.definesHeading1}
                <br />
                <span className="italic text-gold">{a.definesHeadingEm}</span>
              </h2>
              <p className="text-[13px] font-light leading-[2] text-neutral-500 border-b border-neutral-100 pb-4">
                {a.definesBody}
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 border-t border-neutral-100">
              {values.map((v, i) => (
                <motion.div
                  key={v.num}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-5%" }}
                  transition={{ duration: 0.7, ease: EASE, delay: (i % 3) * 0.07 }}
                  className="
                    px-0 py-10
                    border-b border-neutral-100
                    lg:border-e lg:border-neutral-100
                    lg:[&:nth-child(3n)]:border-e-0
                    lg:pe-8 lg:ps-8
                    lg:[&:nth-child(3n+1)]:ps-0
                    lg:[&:nth-child(3n)]:pe-0
                    sm:[&:nth-child(odd)]:pe-6
                    sm:[&:nth-child(even)]:ps-6
                    sm:[&:nth-child(even)]:border-s sm:[&:nth-child(even)]:border-neutral-100
                  "
                >
                  <span className="block text-[11px] tracking-[0.24em] text-gold mb-5 tabular-nums">
                    {v.num}
                  </span>
                  <h3 className="text-[1.35rem] font-light leading-snug tracking-[-0.015em] text-neutral-900 mb-3">
                    {v.title}
                  </h3>
                  <p className="text-[12px] font-light leading-[1.9] text-neutral-400">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ── QUOTE BAND ───────────────────────────────────────────────────── */}
        <section className="relative min-h-[65vh] flex items-center justify-center overflow-hidden">
          <img
            src="images/about-3.jpg"
            alt="quote background"
            className="absolute inset-0 w-full h-full object-cover brightness-[0.28]"
          />
          <FadeInSection>
            <div className="relative z-10 text-center px-6 max-w-3xl mx-auto">
              <span className="block text-[5rem] leading-none text-white/20 mb-6 font-light" aria-hidden>
                "
              </span>
              <p className="text-[clamp(1.5rem,3vw,2.6rem)] font-light italic leading-[1.4] tracking-[-0.015em] text-white">
                {a.quote}
              </p>
            </div>
          </FadeInSection>
        </section>

        {/* ── COLLECTION STRIP ─────────────────────────────────────────────── */}
        <FadeInSection>
          <section className="px-6 py-20 md:px-16 md:py-28 lg:px-24 lg:py-32 bg-neutral-900">

            <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-5 mb-12">
              <h2 className="text-[clamp(1.8rem,3vw,3rem)] font-light leading-[1.08] tracking-[-0.03em] text-white">
                {a.collectionHeading1}
                <br />
                <span className="italic text-gold">{a.collectionHeadingEm}</span>
              </h2>
              <p className="text-[10px] tracking-[0.28em] uppercase text-neutral-600">
                {a.collectionTagline}
              </p>
            </div>

            {/* 4-col product grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-[2px]">
              {products.map((p, i) => (
                <motion.div
                  key={p.label}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.07 }}
                  className="group relative aspect-[3/4] overflow-hidden bg-neutral-800"
                >
                  <img
                    src={p.src}
                    alt={p.label}
                    className="absolute inset-0 w-full h-full object-cover brightness-80 transition-all duration-700 group-hover:scale-[1.06] group-hover:brightness-60"
                  />
                  <span className="absolute bottom-0 inset-x-0 px-4 py-4 bg-gradient-to-t from-black/70 to-transparent text-[9px] tracking-[0.3em] uppercase text-white/70 translate-y-full group-hover:translate-y-0 transition-transform duration-500">
                    {p.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </section>
        </FadeInSection>

        {/* ── CLOSING / VISION ─────────────────────────────────────────────── */}
        <FadeInSection>
          <section className="px-6 py-20 md:px-16 md:py-28 lg:px-24 lg:py-32 bg-white grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

            {/* Text */}
            <div>
              <p className="flex items-center gap-4 text-[9px] tracking-[0.42em] uppercase text-gold mb-10">
                {a.visionLabel}
                <span className="block w-7 h-px bg-neutral-200" />
              </p>
              <h2 className="text-[clamp(2rem,3.5vw,4rem)] font-light leading-[1.08] tracking-[-0.03em] text-neutral-900 mb-8">
                {a.visionHeading1}
                <br />
                {a.visionHeading2}
                <br />
                {a.visionHeading3}{" "}
                <span className="italic text-gold">{a.visionHeadingEm}</span>
              </h2>
              <p className="text-[13px] font-light leading-[2.1] text-neutral-500 mb-10 max-w-md">
                {a.visionBody}
              </p>
              <a
                href="/collections"
                className="inline-flex items-center gap-3 text-[10px] tracking-[0.32em] uppercase text-neutral-900 border-b border-neutral-900 pb-1 hover:text-gold hover:border-neutral-300 transition-colors duration-300"
              >
                {a.visionCta}
                <svg width="16" height="8" viewBox="0 0 16 8" fill="none" aria-hidden>
                  <line x1="0" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1" />
                  <polyline points="10,1 13,4 10,7" stroke="currentColor" strokeWidth="1" fill="none" />
                </svg>
              </a>
            </div>

            {/* Image collage */}
            <div className="relative">
              <img
                src="images/about-4.jfif"
                alt=""
                className="w-full aspect-[3/4] object-cover block"
              />
              {/* Accent image — offset bottom-start */}
              <img
                src="images/about-5.jpg"
                alt=""
                className="absolute bottom-[-8%] start-[-12%] w-[52%] aspect-square object-cover border-[5px] border-white shadow-2xl hidden lg:block"
              />
              {/* Size badge — top-end corner */}
              <div className="absolute top-[-3%] end-[-4%] bg-neutral-900 text-white px-6 py-5 hidden lg:block">
                <span className="block text-[2rem] font-light italic leading-none tracking-[-0.02em]">
                  S–6XL
                </span>
                <span className="block text-[8px] tracking-[0.3em] uppercase text-gold mt-1">
                  {a.sizesLabel}
                </span>
              </div>
            </div>
          </section>
        </FadeInSection>

      </div>
    </PageEnter>
  );
}