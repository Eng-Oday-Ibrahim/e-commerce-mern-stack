import { CustomerService } from "@/lib/services/identity/customer.service";

let cache: Set<string> | null = null;
let loadPromise: Promise<Set<string>> | null = null;

async function loadWishlist(): Promise<Set<string>> {
  if (cache) return cache;
  if (!loadPromise) {
    loadPromise = CustomerService.wishlistList()
      .then((res) => {
        cache = new Set(res.wishlistProductIds ?? []);
        return cache;
      })
      .catch(() => {
        cache = new Set();
        return cache;
      })
      .finally(() => {
        loadPromise = null;
      });
  }
  return loadPromise;
}

export const WishlistService = {
  get: async () => {
    const set = await loadWishlist();
    return new Set(set);
  },
  has: async (productId: string) => {
    const set = await loadWishlist();
    return set.has(productId);
  },
  toggle: async (productId: string) => {
    const set = await loadWishlist();
    if (set.has(productId)) {
      const res = await CustomerService.wishlistRemove(productId);
      cache = new Set(res.wishlistProductIds ?? []);
      return { wished: false, productIds: res.wishlistProductIds ?? [] };
    }
    const res = await CustomerService.wishlistAdd(productId);
    cache = new Set(res.wishlistProductIds ?? []);
    return { wished: true, productIds: res.wishlistProductIds ?? [] };
  },
  clearCache: () => {
    cache = null;
    loadPromise = null;
  },
};

