export type StoreCurrency = {
  code: string;
  symbol?: string;
  decimals?: number;
};

const KEY = "store_currency_v1";

export function setStoreCurrency(currency: StoreCurrency) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(currency));
  } catch {
    // ignore
  }
}

export function getStoreCurrency(): StoreCurrency | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj || typeof obj.code !== "string") return null;
    return {
      code: String(obj.code || "").toUpperCase(),
      symbol: typeof obj.symbol === "string" ? obj.symbol : undefined,
      decimals: typeof obj.decimals === "number" ? obj.decimals : undefined,
    };
  } catch {
    return null;
  }
}

