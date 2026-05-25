import type { Lang } from "./lang";

export type LocalizedStringLike = { ar?: string; en?: string } | null | undefined;

export function pickLocalized(ls: LocalizedStringLike, lang: Lang): string {
  const ar = typeof ls?.ar === "string" ? ls.ar : "";
  const en = typeof ls?.en === "string" ? ls.en : "";
  if (lang === "ar") return ar || en || "";
  return en || ar || "";
}

