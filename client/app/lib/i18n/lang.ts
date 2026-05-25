export type Lang = "en" | "ar";

export const SUPPORTED_LANGS: Lang[] = ["en", "ar"];
export const DEFAULT_LANG: Lang = "en";

const STORAGE_KEY = "sudanista_lang";
const COOKIE_KEY = "sudanista_lang";

export function isLang(value: unknown): value is Lang {
  return value === "en" || value === "ar";
}

export function normalizeLang(value: unknown): Lang {
  if (isLang(value)) return value;
  if (typeof value === "string") {
    const v = value.trim().toLowerCase();
    if (v.startsWith("ar")) return "ar";
    if (v.startsWith("en")) return "en";
  }
  return DEFAULT_LANG;
}

function readCookieLang(): Lang | null {
  if (typeof document === "undefined") return null;
  const parts = document.cookie ? document.cookie.split(";") : [];
  for (const part of parts) {
    const [k, ...rest] = part.trim().split("=");
    if (k === COOKIE_KEY) return normalizeLang(decodeURIComponent(rest.join("=")));
  }
  return null;
}

export function getStoredLang(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const fromLs = localStorage.getItem(STORAGE_KEY);
  if (fromLs) return normalizeLang(fromLs);
  const fromCookie = readCookieLang();
  if (fromCookie) return fromCookie;
  const nav = (navigator.languages?.[0] ?? navigator.language) || "";
  return normalizeLang(nav);
}

export function setStoredLang(lang: Lang): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, lang);
  try {
    document.cookie = `${COOKIE_KEY}=${encodeURIComponent(lang)}; Path=/; Max-Age=${60 * 60 * 24 * 365}`;
  } catch {
    /* ignore */
  }
}

export function getUiLang(): Lang {
  // Dashboard pages are always English per requirement.
  if (typeof window !== "undefined") {
    const path = window.location?.pathname || "";
    if (path.startsWith("/dashboard")) return "en";
  }
  return getStoredLang();
}

export function langDir(lang: Lang): "ltr" | "rtl" {
  return lang === "ar" ? "rtl" : "ltr";
}

