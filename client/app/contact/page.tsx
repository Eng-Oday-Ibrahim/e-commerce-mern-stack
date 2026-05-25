"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Toast } from "@/lib/utils/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";

const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.85, ease: EASE, delay },
});

/* ─── Info row ───────────────────────────────────────────────────────────── */
function InfoRow({
  label,
  value,
  href,
}: {
  label: string;
  value: string;
  href?: string;
}) {
  return (
    <div className="flex flex-col gap-1 py-6 border-b border-neutral-100 last:border-0">
      <span className="text-[9px] tracking-[0.38em] uppercase text-neutral-400">
        {label}
      </span>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[15px] font-light text-neutral-900 tracking-[-0.01em] hover:text-neutral-400 transition-colors duration-300"
        >
          {value}
        </a>
      ) : (
        <span className="text-[15px] font-light text-neutral-900 tracking-[-0.01em]">
          {value}
        </span>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────────────── */
export default function ContactPage() {
  const { m } = useI18n();
  const c = m.pages.contact;

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const subject = encodeURIComponent(c.subject);
    const body = encodeURIComponent(`From: ${email}\n\n${message}`);
    window.location.href = `mailto:${c.email}?subject=${subject}&body=${body}`;
    Toast.success(c.send);
    setMessage("");
  };

  return (
    <PageEnter>
      <div className="min-h-screen bg-white text-neutral-900">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <header className="px-6 md:px-16 lg:px-24 pt-28 pb-16 border-b border-neutral-100">
          <motion.p {...fadeUp(0)} className="text-[9px] tracking-[0.48em] uppercase text-neutral-400 mb-6">
            {c.label}
          </motion.p>
          <motion.h1
            {...fadeUp(0.08)}
            className="text-[clamp(3rem,7vw,6rem)] font-light leading-[0.96] tracking-[-0.04em] text-neutral-900"
          >
            {c.title}
          </motion.h1>
          <motion.p {...fadeUp(0.16)} className="mt-6 text-sm font-light text-neutral-400 tracking-[0.04em]">
            {c.subtitle}
          </motion.p>
        </header>

        {/* ── BODY: 2-col ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.1fr]">

          {/* LEFT — contact info ──────────────────────────────────────────── */}
          <FadeInSection>
            <div className="px-6 md:px-16 lg:px-24 py-16 lg:border-e border-neutral-100">
              <p className="text-[9px] tracking-[0.42em] uppercase text-neutral-400 mb-2">
                {c.infoHeading}
              </p>
              <div className="mt-4">
                <InfoRow
                  label={c.whatsappLabel}
                  value={c.whatsapp}
                  href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                />
                <InfoRow
                  label={c.emailInfoLabel}
                  value={c.email}
                  href={`mailto:${c.email}`}
                />
                <InfoRow
                  label={c.locationLabel}
                  value={c.location}
                />
                <InfoRow
                  label={c.instagramLabel}
                  value={`@${c.instagram}`}
                  href={`https://instagram.com/${c.instagram}`}
                />
                <InfoRow
                  label={c.tiktokLabel}
                  value={`@${c.tiktok}`}
                  href={`https://tiktok.com/@${c.tiktok}`}
                />
              </div>

              {/* Hours block */}
              <div className="mt-12 pt-10 border-t border-neutral-100">
                <div className="mb-6">
                  <p className="text-[9px] tracking-[0.38em] uppercase text-neutral-400 mb-2">
                    {c.hoursLabel}
                  </p>
                  <p className="text-[15px] font-light text-neutral-900 tracking-[-0.01em]">
                    {c.hours}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] tracking-[0.38em] uppercase text-neutral-400 mb-2">
                    {c.responseLabel}
                  </p>
                  <p className="text-[15px] font-light text-neutral-900 tracking-[-0.01em]">
                    {c.response}
                  </p>
                </div>
              </div>
            </div>
          </FadeInSection>

          {/* RIGHT — form ─────────────────────────────────────────────────── */}
          <FadeInSection>
            <div className="px-6 md:px-16 lg:px-16 py-16">
              <p className="text-[9px] tracking-[0.42em] uppercase text-neutral-400 mb-10">
                {c.formHeading}
              </p>

              <div className="space-y-8">
                {/* Email field */}
                <div>
                  <label className="block text-[9px] tracking-[0.32em] uppercase text-neutral-400 mb-3">
                    {c.emailLabel}
                  </label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={c.emailPlaceholder}
                    className="
                      w-full bg-transparent border-0 border-b border-neutral-200
                      rounded-none px-0 py-3
                      text-[14px] font-light text-neutral-900 placeholder:text-neutral-300
                      focus:outline-none focus:border-neutral-900
                      transition-colors duration-300
                    "
                  />
                </div>

                {/* Message field */}
                <div>
                  <label className="block text-[9px] tracking-[0.32em] uppercase text-neutral-400 mb-3">
                    {c.messageLabel}
                  </label>
                  <TextArea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={c.messagePlaceholder}
                    className="
                      w-full bg-transparent border-0 border-b border-neutral-200
                      rounded-none px-0 py-3 resize-none min-h-[160px]
                      text-[14px] font-light text-neutral-900 placeholder:text-neutral-300
                      focus:outline-none focus:border-neutral-900
                      transition-colors duration-300
                    "
                  />
                </div>

                {/* Submit */}
                <div className="pt-4">
                  <button
                    disabled={message.trim().length < 3}
                    onClick={handleSend}
                    className="
                      group inline-flex items-center gap-4
                      text-[10px] tracking-[0.36em] uppercase
                      text-neutral-900 border-b border-neutral-900 pb-1
                      hover:text-neutral-400 hover:border-neutral-300
                      disabled:text-neutral-300 disabled:border-neutral-200 disabled:cursor-not-allowed
                      transition-colors duration-300
                    "
                  >
                    {c.send}
                    <svg
                      width="18"
                      height="8"
                      viewBox="0 0 18 8"
                      fill="none"
                      className="transition-transform duration-300 group-hover:translate-x-1 group-disabled:translate-x-0"
                      aria-hidden
                    >
                      <line x1="0" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1" />
                      <polyline points="12,1 15,4 12,7" stroke="currentColor" strokeWidth="1" fill="none" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* WhatsApp direct CTA */}
              <div className="mt-20 pt-10 border-t border-neutral-100">
                <p className="text-[9px] tracking-[0.32em] uppercase text-neutral-400 mb-4">
                  {c.whatsappLabel}
                </p>
                <a
                  href={`https://wa.me/${c.whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="
                    group inline-flex items-center gap-4
                    text-[10px] tracking-[0.36em] uppercase
                    text-neutral-900 border-b border-neutral-900 pb-1
                    hover:text-neutral-400 hover:border-neutral-300
                    transition-colors duration-300
                  "
                >
                  {c.whatsapp}
                  <svg
                    width="18"
                    height="8"
                    viewBox="0 0 18 8"
                    fill="none"
                    className="transition-transform duration-300 group-hover:translate-x-1"
                    aria-hidden
                  >
                    <line x1="0" y1="4" x2="15" y2="4" stroke="currentColor" strokeWidth="1" />
                    <polyline points="12,1 15,4 12,7" stroke="currentColor" strokeWidth="1" fill="none" />
                  </svg>
                </a>
              </div>
            </div>
          </FadeInSection>
        </div>

      </div>
    </PageEnter>
  );
}