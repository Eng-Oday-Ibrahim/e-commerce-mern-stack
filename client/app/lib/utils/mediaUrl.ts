/**
 * Turn API-relative media paths (e.g. `/storage/...`) into absolute URLs for <img src>.
 */
export function resolveMediaUrl(url: string | undefined | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const base = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (trimmed.startsWith("/") && base) return `${base}${trimmed}`;
  return trimmed;
}
