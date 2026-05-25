'use client';
import { ShieldCheck, Gem, Sofa, Truck } from "lucide-react";
import { motion } from "framer-motion";
import { useI18n } from "@/app/lib/i18n/I18nProvider";

const GOLD          = "#C9A84C";
const GOLD_LIGHT    = "#E0C56F";
const GOLD_DARK     = "#8F6E22";
const GOLD_GRADIENT = `linear-gradient(135deg,${GOLD_DARK} 0%,${GOLD} 55%,${GOLD_LIGHT} 100%)`;
const EASE_EXPO     = [0.16, 1, 0.3, 1] as const;

const items = [
  { icon: ShieldCheck, index: "01" },
  { icon: Gem,          index: "02" },
  { icon: Sofa,         index: "03" },
  { icon: Truck,       index: "04" },
];

export default function TrustSection() {
  const { m } = useI18n();

  return (
    <section>
      {/* ── Top rule ── */}
      <div className="h-px mx-6 md:mx-12" style={{ background: "rgba(0,0,0,0.07)" }} />

      <div className="px-6 md:px-12 py-16">

        {/* ── Section label ── */}
        <motion.div
          className="flex items-center gap-5 mb-12"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE_EXPO }}
        >
          <p className="text-[9px] tracking-[0.38em] uppercase" style={{ color: GOLD }}>
            {m.sections.trust.title}
          </p>
          <div className="h-px flex-1" style={{ background: "rgba(0,0,0,0.06)" }} />
        </motion.div>

        {/* ── Four items ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
          {items.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                className="group px-8 md:px-10 py-10 flex flex-col gap-7 relative"
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.65, ease: EASE_EXPO, delay: i * 0.09 }}
              >
                {/* Index — top right */}
                <span
                  className="absolute top-6 right-7 text-[9px] tracking-[0.25em] tabular-nums"
                  style={{ color: "rgba(0,0,0,0.12)" }}
                >
                  {item.index}
                </span>

                {/* Icon — minimal line square */}
                <div className="relative w-fit">
                  {/* Animated gold corner */}
                  <motion.span
                    className="absolute -bottom-1 -right-1 block w-2.5 h-2.5"
                    style={{ background: GOLD_GRADIENT, opacity: 0 }}
                    initial={false}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.09 + 0.5, duration: 0.4 }}
                  />
                  <div
                    className="w-11 h-11 flex items-center justify-center border transition-colors duration-300 group-hover:border-[#C9A84C]/50"
                    style={{ borderColor: "rgba(0,0,0,0.1)" }}
                  >
                    <Icon size={18} strokeWidth={1.3} style={{ color: GOLD }} />
                  </div>
                </div>

                {/* Text block */}
                <div className="flex flex-col gap-3">
                  <h3
                    className="text-[10px] tracking-[0.24em] uppercase font-medium text-black transition-colors duration-300"
                    style={{ letterSpacing: "0.22em" }}
                  >
                    {m.sections.trust.point[i].title}
                  </h3>
                  <p
                    className="text-[12px] leading-[1.8] max-w-[200px]"
                    style={{ color: "rgba(0,0,0,0.42)", letterSpacing: "0.02em" }}
                  >
                    {m.sections.trust.point[i].desc}
                  </p>
                </div>

                {/* Gold bottom sweep on hover */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[1.5px] pointer-events-none"
                  style={{ background: GOLD_GRADIENT }}
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.5, ease: EASE_EXPO }}
                />
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom rule ── */}
      <div className="h-px mx-6 md:mx-12" style={{ background: "rgba(0,0,0,0.07)" }} />
    </section>
  );
}