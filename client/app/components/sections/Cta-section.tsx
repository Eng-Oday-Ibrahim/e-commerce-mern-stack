"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";

/* ───────────────────────────────────────────── */
/* Brand */
/* ───────────────────────────────────────────── */

const GOLD = "#C9A84C";
const GOLD_LIGHT = "#E8D39A";
const GOLD_DARK = "#8F6E22";

const GOLD_GRADIENT = `linear-gradient(
  135deg,
  ${GOLD_DARK} 0%,
  ${GOLD} 55%,
  ${GOLD_LIGHT} 100%
)`;

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* ───────────────────────────────────────────── */

export default function CTASection() {
  const { m, lang } = useI18n();

  const isRtl = lang === "ar";

  return (
    <section
      dir={isRtl ? "rtl" : "ltr"}
      className="relative overflow-hidden container mx-auto"
    >
      {/* Background Glow */}

      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft gold blur */}

        <div
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[900px] rounded-full opacity-[0.10] blur-3xl"
          style={{
            background: GOLD_GRADIENT,
          }}
        />

        {/* Secondary glow */}

        <div
          className="absolute bottom-0 right-0 w-68 h-68 rounded-full opacity-[0.06] blur-3xl"
          style={{
            background: GOLD_GRADIENT,
          }}
        />
      </div>

      {/* Top Line */}

      <div
        className="relative z-10 h-px mx-6 md:mx-10"
        style={{
          background: "rgba(0,0,0,0.06)",
        }}
      />

      {/* Content */}

      <div className="relative z-10 px-4 md:px-14 py-28">
        <div className="max-w-5xl mx-auto text-center">
          {/* Eyebrow */}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.7,
              ease: EASE_EXPO,
            }}
            className="flex items-center justify-center gap-4 mb-6"
          >
            <div
              className="w-10 h-px"
              style={{
                background: GOLD_GRADIENT,
              }}
            />

            <p
              className="uppercase text-[10px] tracking-[0.38em]"
              style={{
                color: GOLD,
              }}
            >
              {m.home.ctaBadge1}
            </p>

            <div
              className="w-10 h-px"
              style={{
                background: GOLD_GRADIENT,
              }}
            />
          </motion.div>

          {/* Headline */}

          <motion.div
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.9,
              ease: EASE_EXPO,
            }}
            className="space-y-2"
          >
            <h2
              className="font-extralight text-[#111] leading-[0.95] text-3xl"
              style={{
                letterSpacing: "-0.045em",
              }}
            >
              {m.home.ctaTitleLine1}{" "}

              <span
                style={{
                  background: GOLD_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {m.home.ctaTitleHighlight1}
              </span>
            </h2>

            <h2
              className="font-extralight text-[#111] leading-[0.95] text-3xl"
              style={{
                letterSpacing: "-0.045em",
              }}
            >
              <span
                style={{
                  background: GOLD_GRADIENT,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                {m.home.ctaTitleHighlight2}
              </span>{" "}
              {m.home.ctaTitleLine2}
            </h2>
          </motion.div>

          {/* Description */}

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.15,
              ease: EASE_EXPO,
            }}
            className="mx-auto mt-10 max-w-2xl text-sm leading-[1.9]"
            style={{
              color: "rgba(0,0,0,0.48)",
            }}
          >
            {lang === "ar"
              ? "اكتشف قطعًا مصممة بعناية تجمع بين البساطة، الفخامة، والحضور الهادئ الذي يدوم."
              : "Discover carefully crafted pieces that blend simplicity, elegance, and timeless presence."}
          </motion.p>

          {/* Buttons */}

          <motion.div
            initial={{ opacity: 0, y: 22 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.8,
              delay: 0.25,
              ease: EASE_EXPO,
            }}
            className="mt-16 flex flex-col sm:flex-row items-center justify-center gap-5"
          >
            {/* Primary */}

            <Link href="/shop">
              <motion.div
                whileHover={{
                  y: -2,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="relative overflow-hidden px-10 py-4 text-[10px] uppercase tracking-[0.32em] text-white"
                style={{
                  background: GOLD_GRADIENT,
                  boxShadow: "0 10px 40px rgba(201,168,76,0.22)",
                }}
              >
                <span className="relative z-10">
                  {m.home.ctaPrimary}
                </span>
              </motion.div>
            </Link>

            {/* Secondary */}

            <Link href="/about">
              <motion.div
                whileHover={{
                  y: -2,
                }}
                transition={{
                  duration: 0.3,
                }}
                className="group flex items-center gap-3 px-2 py-2 text-xs uppercase tracking-[0.28em]"
                style={{
                  color: "rgba(0,0,0,0.45)",
                }}
              >
                <span>{m.home.ctaSecondary}</span>

                <motion.span
                  initial={{ width: 18 }}
                  whileHover={{ width: 36 }}
                  transition={{
                    duration: 0.35,
                    ease: EASE_EXPO,
                  }}
                  className="h-px"
                  style={{
                    background: GOLD_GRADIENT,
                  }}
                />
              </motion.div>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Bottom Line */}

      <div
        className="relative z-10 h-px mx-6 md:mx-10"
        style={{
          background: "rgba(0,0,0,0.06)",
        }}
      />
    </section>
  );
}