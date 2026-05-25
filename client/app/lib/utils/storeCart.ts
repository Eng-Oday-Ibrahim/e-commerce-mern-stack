import { MarketingApi } from "@/lib/api/marketing";

export type CartLine = {
  productId: string;
  quantity: number;
  selections?: Array<{ optionId: string; valueKeys: string[] }>;
};

const CART_KEY = "cart";
export const CART_CHANGED_EVENT = "sudanista_cart_changed";

export function ensureSessionKey(): string {
  if (typeof window === "undefined") return "";
  let k = localStorage.getItem("sudanista_sid");
  if (!k) {
    k =
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : String(Date.now());
    localStorage.setItem("sudanista_sid", k);
  }
  return k;
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCart(cart: CartLine[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  try {
    window.dispatchEvent(new Event(CART_CHANGED_EVENT));
  } catch {
    /* ignore */
  }
}

export function appendCartLine(line: CartLine) {
  const cart = readCart();
  cart.push(line);
  writeCart(cart);
  try {
    const items = cart.map((entry) => ({
      productId: entry.productId,
      quantity: entry.quantity ?? 1,
      selections: entry.selections,
    }));
    void MarketingApi.cartsTrack({
      sessionKey: ensureSessionKey(),
      currencyCode: "USD",
      items,
    });
  } catch {
    /* ignore analytics failures */
  }
}

export const productPrefillKey = (productId: string) => `sudanista_prefill_${productId}`;

export function getCartCount(cart: CartLine[] = readCart()): number {
  return cart.reduce((sum, line) => sum + (Number.isFinite(line.quantity) ? line.quantity : 0), 0);
}

export function updateCartLine(index: number, patch: Partial<CartLine>) {
  const cart = readCart();
  if (index < 0 || index >= cart.length) return;
  cart[index] = { ...cart[index], ...patch };
  if (!Number.isFinite(cart[index].quantity) || (cart[index].quantity ?? 0) <= 0) {
    cart.splice(index, 1);
  }
  writeCart(cart);
}

export function removeCartLine(index: number) {
  const cart = readCart();
  if (index < 0 || index >= cart.length) return;
  cart.splice(index, 1);
  writeCart(cart);
}

export function clearCart() {
  writeCart([]);
}

export function onCartChanged(cb: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CART_CHANGED_EVENT, cb);
  // Also react to cross-tab updates.
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(CART_CHANGED_EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}
