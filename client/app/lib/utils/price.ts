import { getStoreCurrency } from "@/lib/utils/storeCurrency";

export function formatPrice(
  amount: number,
  opts?: { currencyCode?: string; minimumFractionDigits?: number; maximumFractionDigits?: number }
): string {
  const store = getStoreCurrency();
  const min = opts?.minimumFractionDigits ?? store?.decimals ?? 2;
  const max = opts?.maximumFractionDigits ?? store?.decimals ?? 2;
  const n = Number.isFinite(amount) ? amount : 0;
  const formatted = n.toLocaleString(undefined, { minimumFractionDigits: min, maximumFractionDigits: max });
  const code = opts?.currencyCode ?? store?.code;
  const symbol = store?.symbol;
  if (symbol && (!code || code === store?.code)) return `${formatted} ${symbol}`;
  return code ? `${formatted} ${code}` : formatted;
}

export function parsePrice(value: string): number {
  const normalized = value.trim().replace(/,/g, "");
  if (!/^\d+(\.\d{0,2})?$/.test(normalized)) return 0;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.round((n + Number.EPSILON) * 100) / 100);
}
