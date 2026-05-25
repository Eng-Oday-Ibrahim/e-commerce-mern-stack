"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { MarketingApi, type HeroSlideDto } from "@/lib/api/marketing";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

/* ─── Brand tokens ───────────────────────────────────────────── */
const GOLD          = "#C9A84C";
const GOLD_LIGHT    = "#E0C56F";
const GOLD_DARK     = "#8F6E22";
const GOLD_GRADIENT = `linear-gradient(135deg,${GOLD_DARK} 0%,${GOLD} 55%,${GOLD_LIGHT} 100%)`;

/* ─── Timing ─────────────────────────────────────────────────── */
const SLIDE_MS   = 5800;
const EASE_EXPO  = [0.16, 1, 0.3, 1]         as const;
const EASE_OUT   = [0.25, 0.46, 0.45, 0.94]  as const;
const EASE_SHARP = [0.77, 0, 0.175, 1]        as const;

/* ─── Slide data ─────────────────────────────────────────────── */
type Direction = "right" | "bottom" | "left" | "top";

type Slide = {
  id: string;
  image: string;
  direction: Direction;           // direction the NEW image enters FROM
  en: SlideContent;
  ar: SlideContent;
};
type SlideContent = {
  eyebrow: string;
  line1: string;
  line2: string;
  sub: string;
  cta: string;
  ctaHref: string;
};

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "fallback",
    image: "/images/bg-1.jpg",
    direction: "right",
    en: {
      eyebrow: "Welcome",
      line1: "Discover",
      line2: "New arrivals",
      sub: "Manage hero slides from the dashboard marketing section.",
      cta: "Shop lookbooks",
      ctaHref: "/lookbooks",
    },
    ar: {
      eyebrow: "مرحباً",
      line1: "اكتشف",
      line2: "الإصدارات الجديدة",
      sub: "أضف صور وخطوطًا إلى الصفحة الرئيسية من لوحة التحكم.",
      cta: "تصفح اللوك بوكس",
      ctaHref: "/lookbooks",
    },
  },
];

const HERO_DIRECTIONS: Direction[] = ["right", "bottom", "left", "top"];

function splitHeadline(value: string) {
  const words = value.trim().split(" ");
  if (words.length <= 2) {
    return { line1: value, line2: "" };
  }
  const half = Math.ceil(words.length / 2);
  return {
    line1: words.slice(0, half).join(" "),
    line2: words.slice(half).join(" "),
  };
}

function buildSlideFromHeroSlide(slide: HeroSlideDto, index: number): Slide {
  const titleEn = slide.eyebrow?.en?.trim() || "Featured";
  const titleAr = slide.eyebrow?.ar?.trim() || "مميز";
  const { line1: line1En, line2: line2En } = splitHeadline(slide.line1?.en?.trim() || "");
  const { line1: line1Ar, line2: line2Ar } = splitHeadline(slide.line1?.ar?.trim() || "");
  return {
    id: slide.id ?? String(index),
    image: resolveMediaUrl(slide.image || "/images/bg-1.jpg"),
    direction: HERO_DIRECTIONS[index % HERO_DIRECTIONS.length],
    en: {
      eyebrow: titleEn,
      line1: line1En || slide.line1?.en || "",
      line2: line2En || slide.line2?.en || "",
      sub: slide.sub?.en || "",
      cta: slide.cta?.en || "",
      ctaHref: slide.ctaHref || "/",
    },
    ar: {
      eyebrow: titleAr,
      line1: line1Ar || slide.line1?.ar || "",
      line2: line2Ar || slide.line2?.ar || "",
      sub: slide.sub?.ar || "",
      cta: slide.cta?.ar || "",
      ctaHref: slide.ctaHref || "/",
    },
  };
}

//   {
//     id: 1, image: "/images/bg-1.jpg", direction: "right",
//     en: { eyebrow: "New Collection", line1: "The Art", line2: "of Elegance",     sub: "Timeless pieces curated for the modern visionary.",         cta: "Explore Now",      ctaHref: "/shop"        },
//     ar: { eyebrow: "مجموعة جديدة",  line1: "فن",      line2: "الأناقة",          sub: "قطع خالدة منتقاة للرؤية العصرية.",                          cta: "اكتشف الآن",       ctaHref: "/shop"        },
//   },
//   {
//     id: 2, image: "/images/bg-2.jpg", direction: "bottom",
//     en: { eyebrow: "Exclusive",     line1: "Beyond",   line2: "Ordinary",        sub: "Where craftsmanship meets contemporary vision.",            cta: "Shop Collection",  ctaHref: "/collections" },
//     ar: { eyebrow: "حصري",          line1: "ما وراء",  line2: "العادي",           sub: "حيث يلتقي الحرفية بالرؤية المعاصرة.",                       cta: "تسوق المجموعة",   ctaHref: "/collections" },
//   },
//   {
//     id: 3, image: "/images/bg-3.jpg", direction: "left",
//     en: { eyebrow: "Autumn / Winter", line1: "Refined", line2: "Luxury",         sub: "A new chapter in sophisticated dressing.",                  cta: "Discover",         ctaHref: "/shop"        },
//     ar: { eyebrow: "خريف / شتاء",   line1: "الفخامة", line2: "الراقية",          sub: "فصل جديد في الأناقة الرفيعة.",                              cta: "اكتشف",            ctaHref: "/shop"        },
//   },
//   {
//     id: 4, image: "/images/bg-4.jpg", direction: "top",
//     en: { eyebrow: "Limited Edition", line1: "Iconic", line2: "Pieces",          sub: "Rare designs for the discerning few.",                      cta: "View All",         ctaHref: "/shop"        },
//     ar: { eyebrow: "إصدار محدود",   line1: "قطع",     line2: "أيقونية",           sub: "تصاميم نادرة للذوق الرفيع.",                                cta: "عرض الكل",         ctaHref: "/shop"        },
//   },
//   {
//     id: 5, image: "/images/bg-2.jpg", direction: "right",
//     en: { eyebrow: "Our Story",     line1: "Born from", line2: "Passion",        sub: "Crafted with intent. Worn with purpose.",                   cta: "About Us",         ctaHref: "/about"       },
//     ar: { eyebrow: "قصتنا",         line1: "وُلد من",  line2: "الشغف",            sub: "صُنع بقصد. يُرتدى بهدف.",                                   cta: "من نحن",           ctaHref: "/about"       },
//   },
// ];

/* ─── Direction offsets ──────────────────────────────────────── */
const OFFSETS: Record<Direction, { x: string | number; y: string | number }> = {
  right:  { x: "102%",  y: 0       },
  left:   { x: "-102%", y: 0       },
  bottom: { x: 0,       y: "102%"  },
  top:    { x: 0,       y: "-102%" },
};
const OPPOSITE: Record<Direction, Direction> = {
  right: "left", left: "right", bottom: "top", top: "bottom",
};

/* ─── Framer variants ────────────────────────────────────────── */
const imageVariants = {
  enter: (dir: Direction) => ({
    ...OFFSETS[dir],
    scale: 1.06,
  }),
  center: {
    x: 0, y: 0, scale: 1,
    transition: { duration: 1.15, ease: EASE_EXPO },
  },
  exit: (dir: Direction) => ({
    ...OFFSETS[OPPOSITE[dir]],
    scale: 0.98,
    transition: { duration: 0.95, ease: EASE_SHARP },
  }),
};

// Ken Burns: subtle slow zoom on the settled image
const kenBurns = {
  animate: { scale: 1.07 },
  transition: { duration: SLIDE_MS / 1000 + 1, ease: "linear" as const },
};

// Clip-path text reveal (bottom → top, line by line)
function textLine(delay: number) {
  return {
    hidden: { clipPath: "inset(105% 0 0 0)", y: 14, opacity: 0 },
    show: {
      clipPath: "inset(0% 0 0 0)", y: 0, opacity: 1,
      transition: { duration: 0.75, ease: EASE_EXPO, delay },
    },
    exit: {
      clipPath: "inset(0% 0 105% 0)", y: -10, opacity: 0,
      transition: { duration: 0.35, ease: EASE_SHARP, delay: 0 },
    },
  };
}

const fadeUp = (delay: number) => ({
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE_OUT, delay } },
  exit:  { opacity: 0, y: -8, transition: { duration: 0.3, delay: 0 } },
});

/* ─── Component ──────────────────────────────────────────────── */
export default function HeroSection() {
  const { lang } = useI18n();
  const prefersReduced = useReducedMotion();

  const [idx, setIdx]             = useState(0);
  const [direction, setDirection] = useState<Direction>(DEFAULT_SLIDES[0].direction);
  const [slides, setSlides]       = useState<Slide[]>(DEFAULT_SLIDES);
  const [paused, setPaused]       = useState(false);
  const [inTransit, setInTransit] = useState(false);
  const timerRef                  = useRef<number | null>(null);

  const goTo = useCallback((next: number) => {
    if (inTransit) return;
    const target = (next + slides.length) % slides.length;
    setDirection(slides[target].direction);
    setInTransit(true);
    setIdx(target);
    setTimeout(() => setInTransit(false), 1300);
  }, [inTransit, slides]);

  useEffect(() => {
    (async () => {
      try {
        const res = await MarketingApi.heroSlidesListPublic();
        const heroSlides = (res.heroSlides ?? [])
          .filter((slide) => slide.published && slide.image)
          .map((slide, index) => buildSlideFromHeroSlide(slide, index));

        if (heroSlides.length) {
          setSlides(heroSlides);
          setIdx(0);
          setDirection(heroSlides[0].direction);
        }
      } catch {
        // ignore and keep fallback slides
      }
    })();
  }, []);

  /* Auto-advance */
  useEffect(() => {
    if (paused) return;
    timerRef.current = window.setInterval(() => goTo(idx + 1), SLIDE_MS);
    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current);
      }
    };
  }, [idx, paused, goTo]);

  const slide = slides[idx % slides.length];
  const content = lang === "ar" ? slide.ar : slide.en;
  const isRtl = lang === "ar";

  return (
    <section className="relative w-full overflow-hidden select-none"
      style={{ height: "90svh", minHeight: 560 }}
      dir={isRtl ? "rtl" : "ltr"} >

      {/* ══════════ BACKGROUND IMAGES ══════════ */}
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={slide.id}
          className="absolute inset-0 w-full h-full"
          custom={direction}
          variants={prefersReduced ? {} : imageVariants}
          initial="enter"
          animate="center"
          exit="exit"
        >
          {/* Ken Burns on settled image */}
          <motion.div
            className="absolute inset-0 w-full h-full"
            animate={!prefersReduced ? kenBurns.animate : undefined}
            transition={!prefersReduced ? kenBurns.transition : undefined}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.image}
              alt=""
              className="absolute inset-0 w-full h-full object-cover"
              draggable={false}
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* ══════════ OVERLAYS ══════════ */}

      {/* Base dark gradient — heavier at bottom */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.08) 40%, rgba(0,0,0,0.55) 75%, rgba(0,0,0,0.78) 100%)",
        }}
      />

      {/* Side vignette */}
      <div className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: isRtl
            ? "linear-gradient(to left,  rgba(0,0,0,0.45) 0%, transparent 55%)"
            : "linear-gradient(to right, rgba(0,0,0,0.45) 0%, transparent 55%)",
        }}
      />

      {/* Gold flash on transition */}
      <AnimatePresence>
        {inTransit && (
          <motion.div
            key="flash"
            className="absolute inset-0 z-20 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.12, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, times: [0, 0.3, 1] }}
            style={{ backgroundColor: GOLD }}
          />
        )}
      </AnimatePresence>

      {/* ══════════ CONTENT ══════════ */}
      <div className="absolute inset-0 z-30 flex flex-col justify-between pointer-events-none">

        {/* ── Top row — eyebrow + slide count ── */}
        <div className={`flex items-start justify-between px-8 md:px-16 pt-8 md:pt-12 ${isRtl ? "flex-row-reverse" : ""}`}>

          {/* Eyebrow */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`eyebrow-${idx}`}
              variants={fadeUp(0)}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex items-center gap-3"
            >
              {/* Gold accent dot */}
              <motion.span
                className="block w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: GOLD_GRADIENT }}
                animate={{ scale: [1, 1.4, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 1 }}
              />
              <span
                className="text-[9px] tracking-[0.35em] uppercase font-medium"
                style={{ color: GOLD_LIGHT }}
              >
                {content.eyebrow}
              </span>
            </motion.div>
          </AnimatePresence>

          {/* Slide counter */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`count-${idx}`}
              variants={fadeUp(0.1)}
              initial="hidden"
              animate="show"
              exit="exit"
              className="flex items-baseline gap-1.5 pointer-events-auto"
            >
              <span
                className="text-[clamp(1rem,2.5vw,1.4rem)] font-extralight tabular-nums leading-none"
                style={{ color: "rgba(255,255,255,0.9)", letterSpacing: "0.04em" }}
              >
                {String(idx + 1).padStart(2, "0")}
              </span>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 11 }}>/</span>
              <span
                className="text-[10px] tabular-nums"
                style={{ color: "rgba(255,255,255,0.3)", letterSpacing: "0.06em" }}
              >
                {String(slides.length).padStart(2, "0")}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Bottom content ── */}
        <div className={`px-8 md:px-16 pb-20 md:pb-24 flex ${isRtl ? "flex-row-reverse" : "flex-row"} items-end justify-between gap-8`}>

          {/* Left — headline block */}
          <div className="flex flex-col gap-4 max-w-[min(680px,85vw)]">

            {/* Headline — two lines with clip-path reveal */}
            <div className="overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`h1-${idx}`}
                  variants={textLine(0.05)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="block font-extralight leading-[0.92] text-white"
                  style={{
                    fontSize: "clamp(3rem, 9.5vw, 9rem)",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  {content.line1}
                </motion.h2>
              </AnimatePresence>
            </div>

            <div className="overflow-hidden" style={{ marginTop: "-0.05em" }}>
              <AnimatePresence mode="wait">
                <motion.h2
                  key={`h2-${idx}`}
                  variants={textLine(0.18)}
                  initial="hidden"
                  animate="show"
                  exit="exit"
                  className="block font-extralight leading-[0.92] text-white"
                  style={{
                    fontSize: "clamp(3rem, 9.5vw, 9rem)",
                    letterSpacing: "-0.025em",
                    textShadow: "0 2px 40px rgba(0,0,0,0.3)",
                  }}
                >
                  {/* Gold last word accent */}
                  {content.line2.split(" ").map((word, i, arr) =>
                    i === arr.length - 1 ? (
                      <span key={i} style={{ background: GOLD_GRADIENT, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                        {word}
                      </span>
                    ) : (
                      <span key={i}>{word} </span>
                    )
                  )}
                </motion.h2>
              </AnimatePresence>
            </div>

            {/* Gold rule */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`rule-${idx}`}
                initial={{ scaleX: 0, originX: isRtl ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                exit={{ scaleX: 0, originX: isRtl ? 0 : 1 }}
                transition={{ duration: 0.7, delay: 0.3, ease: EASE_EXPO }}
                className="h-px w-16"
                style={{ background: GOLD_GRADIENT }}
              />
            </AnimatePresence>

            {/* Sub text */}
            <AnimatePresence mode="wait">
              <motion.p
                key={`sub-${idx}`}
                variants={fadeUp(0.38)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="text-[12px] md:text-[13px] leading-relaxed max-w-xs md:max-w-sm"
                style={{ color: "rgba(255,255,255,0.6)", letterSpacing: "0.04em" }}
              >
                {content.sub}
              </motion.p>
            </AnimatePresence>

            {/* CTA */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`cta-${idx}`}
                variants={fadeUp(0.52)}
                initial="hidden"
                animate="show"
                exit="exit"
                className="pointer-events-auto mt-2"
              >
                <Link
                  href={content.ctaHref}
                  className="group relative inline-flex items-center gap-3 overflow-hidden"
                >
                  {/* Button fill */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: GOLD_GRADIENT }}
                    initial={{ scaleX: 0, originX: 0 }}
                    whileHover={{ scaleX: 1 }}
                    transition={{ duration: 0.4, ease: EASE_EXPO }}
                  />
                  {/* Border */}
                  <span
                    className="relative z-10 border px-7 py-3 text-[10px] tracking-[0.28em] uppercase font-medium transition-colors duration-300"
                    style={{ borderColor: `rgba(201,168,76,0.7)`, color: "rgba(255,255,255,0.9)" }}
                  >
                    {content.cta}
                  </span>
                  {/* Arrow that slides in */}
                  <motion.span
                    className="relative z-10 text-[11px] text-white/40 group-hover:text-white"
                    initial={{ x: -4, opacity: 0 }}
                    whileHover={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isRtl ? "←" : "→"}
                  </motion.span>
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right — vertical navigation */}
          <div className={`hidden md:flex flex-col items-center gap-5 pb-2 pointer-events-auto`}>

            {/* Nav dots — vertical */}
            <div className="flex flex-col items-center gap-2.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className="relative flex items-center justify-center transition-all duration-300"
                  style={{ width: 16, height: i === idx ? 28 : 12 }}
                >
                  <motion.span
                    className="block w-px"
                    animate={{
                      height:          i === idx ? 28 : 4,
                      background:      i === idx ? GOLD_GRADIENT : "rgba(255,255,255,0.3)",
                    }}
                    transition={{ duration: 0.35, ease: EASE_EXPO }}
                  />
                </button>
              ))}
            </div>

            {/* Prev / Next */}
            <div className="flex flex-col gap-2 mt-2">
              {[
                { label: "↑", action: () => goTo(idx - 1) },
                { label: "↓", action: () => goTo(idx + 1) },
              ].map(({ label, action }) => (
                <motion.button
                  key={label}
                  type="button"
                  onClick={action}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.92 }}
                  className="flex items-center justify-center w-8 h-8 border transition-colors duration-200"
                  style={{ borderColor: "rgba(255,255,255,0.2)", color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = GOLD; (e.currentTarget as HTMLElement).style.color = GOLD; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.2)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                >
                  <span className="text-[11px]">{label}</span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ══════════ PROGRESS BAR ══════════ */}
      <div className="absolute bottom-0 left-0 right-0 z-40 h-[2px] bg-white/10">
        <motion.div
          key={`progress-${idx}`}
          className="h-full"
          style={{
            background: GOLD_GRADIENT,
            transformOrigin: isRtl ? "right" : "left",
          }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: paused ? undefined : 1 }}
          transition={{ duration: SLIDE_MS / 1000, ease: "linear" }}
        />
      </div>

      {/* ══════════ MOBILE DOTS ══════════ */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 md:hidden">
        {slides.map((s, i) => (
          <button
            key={s.id}
            type="button"
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="transition-all duration-300"
            style={{
              width:           i === idx ? 18 : 4,
              height:          2,
              backgroundColor: i === idx ? GOLD : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* ══════════ MOBILE PREV / NEXT ══════════ */}
      {["left", "right"].map((side) => {
        const isPrev = isRtl ? side === "right" : side === "left";
        return (
          <button
            key={side}
            type="button"
            onClick={() => isPrev ? goTo(idx - 1) : goTo(idx + 1)}
            className="absolute top-1/2 -translate-y-1/2 z-40 md:hidden w-10 h-16 flex items-center justify-center transition-colors duration-200"
            style={{
              [side]: 0,
              color: "rgba(255,255,255,0.4)",
              background: "linear-gradient(to " + (side === "left" ? "right" : "left") + ", rgba(0,0,0,0.25), transparent)",
            }}
          >
            <span className="text-base">{side === "left" ? "‹" : "›"}</span>
          </button>
        );
      })}

      {/* ══════════ SLIDE NAME STRIP ══════════ */}
      {/* Vertical label right edge — decorative editorial detail */}
      <div
        className="absolute right-6 top-1/2 -translate-y-1/2 z-30 hidden lg:flex flex-col items-center gap-3 pointer-events-none"
        style={{ writingMode: "vertical-rl" }}
      >
        <AnimatePresence mode="wait">
          <motion.span
            key={`label-${idx}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: EASE_EXPO }}
            className="text-[8px] tracking-[0.35em] uppercase"
            style={{ color: "rgba(255,255,255,0.22)", letterSpacing: "0.3em" }}
          >
            {content.eyebrow}
          </motion.span>
        </AnimatePresence>
      </div>

    </section>
  );
}