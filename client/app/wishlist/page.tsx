"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { ProductApi } from "@/lib/api/catalog/product";
import type { ProductDto } from "@/lib/api/catalog/types";
import { ProductCard } from "@/components/ui/Product-Card";
import { CustomerService } from "@/lib/services/identity/customer.service";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";
import { ShopProductGridSkeleton } from "@/components/ui/Skeletons";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function WishlistPage() {
  const { m } = useI18n();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ProductDto[]>([]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const wish = await CustomerService.wishlistList();
        const ids = wish.wishlistProductIds ?? [];
        if (ids.length === 0) {
          setProducts([]);
          return;
        }
        const rows = await Promise.all(ids.map((id) => ProductApi.getStoreDetail(id).then((r) => r.product).catch(() => null)));
        setProducts(rows.filter((x): x is ProductDto => !!x));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageEnter>
    <div className="mx-auto w-full max-w-6xl px-4 py-8 space-y-4">
      <FadeInSection>
      <h1 className="text-2xl font-semibold">{m.pages.wishlist.title}</h1>
      {loading ? (
        <div className="pt-4">
          <ShopProductGridSkeleton count={3} />
        </div>
      ) : products.length === 0 ? (
        <Empty
          variant="wishlist"
          title={m.pages.wishlist.empty}
          description={m.pages.wishlist.title}
          actionLabel={m.pages.wishlist.browse}
          actionHref="/shop"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
      </FadeInSection>
    </div>
    </PageEnter>
  );
}
