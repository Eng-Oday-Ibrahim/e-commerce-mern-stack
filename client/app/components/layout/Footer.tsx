"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Messages } from "@/lib/i18n/messages";

const EASE = [0.22, 1, 0.36, 1] as const;

const NAV_LINKS: Array<{ key: keyof Messages["nav"]; href: string }> = [
  { key: "home",        href: "/" },
  { key: "shop",        href: "/shop" },
  { key: "collections", href: "/collections" },
  { key: "categories",  href: "/categories" },
  { key: "lookbooks",   href: "/lookbooks" },
  { key: "about",       href: "/about" },
  { key: "contact",     href: "/contact" },
];

const POLICY_LINKS = [
  { labelKey: "privacyLabel",  href: "/privacy-policy" },
  { labelKey: "refundLabel",   href: "/refund-policy" },
  { labelKey: "shippingLabel", href: "/shipping-policy" },
  { labelKey: "termsLabel",    href: "/terms" },
] as const;

const CUSTOMER_LINKS = [
  { labelKey: "myOrdersLabel",   href: "/my-orders" },
  { labelKey: "wishlistLabel",   href: "/wishlist" },
  { labelKey: "trackOrderLabel", href: "/track-order" },
  { labelKey: "accountLabel",    href: "/account" },
] as const;

/* ─── Section heading ────────────────────────────────────────────────────── */
function ColHeading({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-7 text-[9px] tracking-[0.44em] uppercase text-gold">
      {children}
    </p>
  );
}

/* ─── Footer link ────────────────────────────────────────────────────────── */
function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="
        w-fit block text-[13px] font-light leading-none
        text-white/40 hover:text-white/80
        transition-colors duration-300
      "
    >
      {children}
    </Link>
  );
}

/* ─── Contact row ────────────────────────────────────────────────────────── */
function ContactRow({ label, value, href }: { label: string; value: string; href?: string }) {
  const content = (
    <>
      <span className="block text-[9px] tracking-[0.32em] uppercase text-white/22 mb-1.5">
        {label}
      </span>
      <span className="block text-[13px] font-light text-white/48 leading-snug">
        {value}
      </span>
    </>
  );

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-80 transition-opacity duration-300"
      >
        {content}
      </a>
    );
  }
  return <div>{content}</div>;
}

/* ─── Footer ─────────────────────────────────────────────────────────────── */
export default function Footer() {
  const { m } = useI18n();
  const year = new Date().getFullYear();

  return (
    <footer className="relative w-full overflow-hidden bg-deep-black text-white">

      {/* Gold top rule */}
      <div className="h-px w-full bg-gradient-to-r from-gold/30 via-gold to-gold/30" />

      {/* ── Main body ───────────────────────────────────────────────────── */}
      <div className="px-6 md:px-16 lg:px-24 py-24 md:py-32">

        {/* Brand block — centred */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: EASE }}
          className="text-center mb-24 md:mb-28"
        >
          <Link
            href="/"
            className="inline-block text-[clamp(2rem,5vw,3.5rem)] font-light tracking-[0.22em] uppercase text-white"
          >
            SUDANISTA
          </Link>
          <div className="mx-auto mt-5 mb-0 w-8 h-px bg-gold/40" />
          <p className="mt-7 text-[13px] font-light leading-[2] text-white/38 max-w-sm mx-auto">
            {m.sections.footer.description}
          </p>
        </motion.div>

        {/* ── 4-col link grid ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-12 md:gap-8 max-w-5xl mx-auto">

          {/* Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.08 }}
          >
            <ColHeading>{m.sections.footer.navigationLabel}</ColHeading>
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((item) => (
                <FooterLink key={item.key} href={item.href}>
                  {m.nav[item.key]}
                </FooterLink>
              ))}
            </nav>
          </motion.div>

          {/* Customer */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.14 }}
          >
            <ColHeading>{m.sections.footer.customerLabel}</ColHeading>
            <div className="flex flex-col gap-4">
              {CUSTOMER_LINKS.map((item) => (
                <FooterLink key={item.labelKey} href={item.href}>
                  {m.sections.footer[item.labelKey]}
                </FooterLink>
              ))}
            </div>
          </motion.div>

          {/* Policies */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.2 }}
          >
            <ColHeading>{m.sections.footer.termsLabel}</ColHeading>
            <div className="flex flex-col gap-4">
              {POLICY_LINKS.map((item) => (
                <FooterLink key={item.labelKey} href={item.href}>
                  {m.sections.footer[item.labelKey]}
                </FooterLink>
              ))}
            </div>
          </motion.div>

          {/* Contact */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: EASE, delay: 0.26 }}
          >
            <ColHeading>{m.sections.footer.contactLabel}</ColHeading>
            <div className="flex flex-col gap-6">
              <ContactRow
                label={m.sections.footer.phoneLabel}
                value={m.sections.footer.phone}
                href={`https://wa.me/${m.sections.footer.phone.replace(/\D/g, "")}`}
              />
              <ContactRow
                label={m.sections.footer.emailLabel}
                value={m.sections.footer.email}
                href={`mailto:${m.sections.footer.email}`}
              />
              <ContactRow
                label={m.sections.footer.locationLabel}
                value={m.sections.footer.location}
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* ── Bottom bar ──────────────────────────────────────────────────── */}
      <div className="px-6 md:px-16 lg:px-24 py-6 border-t border-white/[0.05] flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-[11px] font-light text-white/24 tracking-[0.06em]">
          © {year} SUDANISTA. {m.sections.footer.rights}
        </p>

        {/* Social handles */}
        <div className="flex items-center gap-6">
          <a
            href="https://instagram.com/sudanistaa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.24em] uppercase text-white/24 hover:text-white/60 transition-colors duration-300"
          >
            Instagram
          </a>
          <span className="w-px h-3 bg-white/10" aria-hidden />
          <a
            href="https://tiktok.com/@sudanistaa"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] tracking-[0.24em] uppercase text-white/24 hover:text-white/60 transition-colors duration-300"
          >
            TikTok
          </a>
        </div>
      </div>
    </footer>
  );
}