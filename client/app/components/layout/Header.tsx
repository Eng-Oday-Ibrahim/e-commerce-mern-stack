import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";
import { Menu, X, ShoppingBag, Heart, User, ChevronDown } from "lucide-react";
import { AnnouncementBar } from "./Announcement-bar";
import { getCartCount, onCartChanged, readCart } from "@/lib/utils/storeCart";
import { useI18n } from "@/lib/i18n/I18nProvider";
import type { Messages } from "@/lib/i18n/messages";
import { CustomerApi } from "@/api/identity/customer";

const navLinks: Array<{ key: keyof Messages["nav"]; href: string }> = [
  { key: "home", href: "/" },
  { key: "shop", href: "/shop" },
  { key: "collections", href: "/collections" },
  { key: "categories", href: "/categories" },
  { key: "lookbooks", href: "/lookbooks" },
  { key: "about", href: "/about" },
  { key: "contact", href: "/contact" },
];

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const [customerInitial, setCustomerInitial] = useState<string | null>(null);

  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const { lang, setLang, m } = useI18n();

  // Mount on client only
  useEffect(() => {
    setMounted(true);
  }, []);

  // Cart sync
  useEffect(() => {
    setCartCount(getCartCount(readCart()));
    return onCartChanged(() => setCartCount(getCartCount(readCart())));
  }, []);

  // Customer initial
  useEffect(() => {
    let cancelled = false;
    CustomerApi.me()
      .then((res) => {
        const email = res.customer?.email?.trim() || "";
        const initial = email ? email[0].toUpperCase() : null;
        if (!cancelled) setCustomerInitial(initial);
      })
      .catch(() => {
        if (!cancelled) setCustomerInitial(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        langRef.current &&
        !langRef.current.contains(target) &&
        mobileLangRef.current &&
        !mobileLangRef.current.contains(target)
      ) {
        setLangOpen(false);
      }
    };

    if (langOpen) {
      window.addEventListener("click", handleClickOutside);
    }

    return () => window.removeEventListener("click", handleClickOutside);
  }, [langOpen]);

  // Prevent body scroll when drawer open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Drawer (Portal) - only render on client
  const drawer = mounted
    ? createPortal(
        <div
          className={`fixed inset-0 z-[999] transition-all duration-300 ${
            open
              ? "visible opacity-100"
              : "invisible opacity-0 pointer-events-none"
          }`}
        >
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/70"
          />

          {/* Panel */}
          <div
            className={`absolute right-0 top-0 h-full w-[84%] max-w-sm bg-deep-black p-6 transition-transform duration-300 ${
              open ? "translate-x-0" : "translate-x-full"
            }`}
          >
            <div className="flex justify-between mb-6">
              <Image src="/images/logo.png" alt="logo" width={35} height={35} />
              <button onClick={() => setOpen(false)}>
                <X size={24} className="text-white" />
              </button>
            </div>

            <nav className="flex flex-col gap-6">
              {navLinks.map((item) => (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="text-white/80"
                >
                  {m.nav[item.key]}
                </Link>
              ))}
            </nav>
            {/* Mobile Language Switcher */}
            <div
              ref={mobileLangRef}
              className="mt-8 border-t border-white/10 pt-6"
            >
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    lang === "en"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="fi fi-gb"></span>
                  English
                </button>
                <button
                  onClick={() => {
                    setLang("ar");
                    setLangOpen(false);
                  }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm ${
                    lang === "ar"
                      ? "bg-white/20 text-white"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <span className="fi fi-sa"></span>
                  العربية
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
      <header className="sticky top-0 z-50 w-full overflow-visible border-b border-gray-100 bg-white/95 backdrop-blur-md text-deep-black">
        <div className="relative z-10">
          <AnnouncementBar />
        </div>

        <div className="mx-auto flex h-18 items-center justify-between px-4 sm:px-6 lg:px-10">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/images/logo.png"
              alt="SUDANISTA Logo"
              width={40}
              height={40}
              priority
              className="object-contain"
            />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-10">
            {navLinks.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="text-sm tracking-[0.14em] uppercase text-deep-black/80 transition hover:text-gold"
              >
                {m.nav[item.key]}
              </Link>
            ))}
          </nav>

          {/* Desktop Right */}
          <div className="hidden lg:flex items-center gap-5">
            {/* Language */}
            <div ref={langRef} className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLangOpen((prev) => !prev);
                }}
                className="flex items-center gap-2 border-b border-black/10 px-2 py-1"
              >
                <span
                  className={lang === "en" ? "fi fi-gb" : "fi fi-sa"}
                ></span>
                <ChevronDown
                  size={14}
                  className={`transition ${langOpen ? "rotate-180" : ""}`}
                />
              </button>

              <div
                className={`absolute right-0 mt-2 w-32 rounded-md border border-black/10 bg-white shadow-md z-[999] overflow-hidden transition-all duration-200 ${
                  langOpen
                    ? "opacity-100 translate-y-0 visible"
                    : "opacity-0 -translate-y-2 invisible"
                }`}
              >
                <button
                  onClick={() => {
                    setLang("en");
                    setLangOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                >
                  <span className="fi fi-gb"></span>
                  English
                </button>

                <button
                  onClick={() => {
                    setLang("ar");
                    setLangOpen(false);
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 hover:bg-gray-100"
                >
                  <span className="fi fi-sa"></span>
                  العربية
                </button>
              </div>
            </div>

            {/* Cart */}
            <Link href="/cart" className="relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 bg-gold text-[10px] px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Wishlist */}
            <Link href="/wishlist">
              <Heart size={20} />
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="text-white bg-gradient-to-br from-gold-dark via-gold to-gold-light p-1"
            >
              {customerInitial ? (
                <span className="inline-flex h-6 w-6 items-center justify-center text-xs font-semibold">
                  {customerInitial}
                </span>
              ) : (
                <User size={20} />
              )}
            </Link>
          </div>

          {/* Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <Link href="/cart" className="relative">
              <ShoppingBag size={20} />
              {cartCount > 0 && (
                <span className="absolute -right-2 -top-2 bg-gold text-[10px] px-1 rounded-full">
                  {cartCount}
                </span>
              )}
            </Link>

            <Link href="/wishlist">
              <Heart size={20} />
            </Link>

            <button onClick={() => setOpen(true)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {drawer}
    </>
  );
}
