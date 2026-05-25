"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ProductApi } from "@/lib/api/catalog/product";
import type { OptionDto, ProductDto } from "@/lib/api/catalog/types";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Toast } from "@/lib/utils/toast";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { pickLocalized } from "@/lib/i18n/localize";
import {
  onCartChanged,
  readCart,
  removeCartLine,
  updateCartLine,
  type CartLine,
  clearCart,
} from "@/lib/utils/storeCart";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";
import Skeleton from "react-loading-skeleton";
import { CartLineTitleSkeleton } from "@/components/ui/Skeletons";
import MediaImage from "@/components/ui/MediaImage";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import Empty from "@/components/ui/Empty";

function lineUnitPrice(_line: CartLine, product: ProductDto, _options: OptionDto[]): number {
  return product.price ?? 0;
}

export default function CartPage() {
  const { lang, m } = useI18n();
  const [cart, setCart] = useState<CartLine[]>(() => readCart());
  const [details, setDetails] = useState<Record<string, { product: ProductDto; options: OptionDto[] }>>({});

  useEffect(() => onCartChanged(() => setCart(readCart())), []);

  const missingIds = useMemo(() => {
    const ids = Array.from(new Set(cart.map((c) => c.productId))).filter(Boolean);
    return ids.filter((id) => !details[id]).sort();
  }, [cart, details]);

  const isUpdating = missingIds.length > 0;

  useEffect(() => {
    if (missingIds.length === 0) return;

    let cancelled = false;
    Promise.all(
      missingIds.map(async (id) => {
        const res = await ProductApi.getStoreDetail(id);
        return [id, { product: res.product, options: res.options as OptionDto[] }] as const;
      })
    )
      .then((pairs) => {
        if (cancelled) return;
        setDetails((prev) => {
          const next = { ...prev };
          for (const [id, value] of pairs) next[id] = value;
          return next;
        });
      })
      .catch((err) => {
        if (!cancelled) Toast.error(getApiErrorMessage(err));
      })

    return () => {
      cancelled = true;
    };
  }, [missingIds]);

  const rows = useMemo(() => {
    return cart.map((line, idx) => {
      const d = details[line.productId];
      const product = d?.product;
      const options = d?.options ?? [];
      const unit = product ? lineUnitPrice(line, product, options) : 0;
      const qty = Number.isFinite(line.quantity) ? Math.max(1, Math.round(line.quantity)) : 1;
      const total = unit * qty;
      return { idx, line, product, options, qty, unit, total };
    });
  }, [cart, details]);

  const cartTotal = useMemo(() => rows.reduce((s, r) => s + r.total, 0), [rows]);

  return (
    <PageEnter>
    <div className="mx-auto w-full max-w-5xl px-4 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{m.pages.cart.title}</h1>
          <p className="text-sm text-black/60 mt-1">
            {m.pages.cart.subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={cart.length === 0}
            onClick={() => {
              clearCart();
              Toast.cartCleared();
            }}
          >
            {m.common.clear}
          </Button>
          <Link href="/shop">
            <Button variant="secondary" size="sm">
              {m.common.continueShopping}
            </Button>
          </Link>
        </div>
      </div>

      <FadeInSection>
      {cart.length === 0 ? (
        <div className="mt-6">
          <Empty
            variant="cart"
            title={m.pages.cart.empty}
            description={m.pages.cart.subtitle}
            actionLabel={m.pages.cart.browse}
            actionHref="/shop"
          />
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {rows.map((row) => (
            <Card key={`${row.line.productId}-${row.idx}`} className="p-4">
              <div className="flex gap-4">
                {/* Product Image */}
                <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.03]">
                  {row.product ? (
                    <MediaImage
                      src={resolveMediaUrl(row.product.images?.[0])}
                      alt={pickLocalized(row.product.name, lang) || row.product.slug}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  ) : (
                    <Skeleton className="h-full w-full" />
                  )}
                </div>

                {/* Product Info and Controls */}
                <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {row.product ? pickLocalized(row.product.name, lang) || row.product.slug : <CartLineTitleSkeleton />}
                    </div>
                    {row.line.selections?.length ? (
                      <div className="mt-1 text-xs text-black/55 space-y-1">
                        {row.line.selections.map((sel) => (
                          <div key={sel.optionId}>
                            {sel.optionId}: {sel.valueKeys?.join(", ") || "—"}
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  <div className="flex items-center justify-between gap-3 sm:justify-end">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartLine(row.idx, { quantity: Math.max(1, row.qty - 1) })}
                      >
                        -
                      </Button>
                      <input
                        className="h-9 w-14 rounded border border-black/10 text-center text-sm"
                        inputMode="numeric"
                        value={row.qty}
                        onChange={(e) => {
                          const n = Number(e.target.value);
                          if (!Number.isFinite(n)) return;
                          updateCartLine(row.idx, { quantity: Math.max(1, Math.round(n)) });
                        }}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateCartLine(row.idx, { quantity: row.qty + 1 })}
                      >
                        +
                      </Button>
                    </div>

                    <div className="w-28 text-right text-sm font-medium">
                      {formatPrice(row.total)}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="text-xs text-black/55">
                  {row.product ? (
                    <>
                      {m.pages.cart.unit}: {formatPrice(row.unit)}
                      {isUpdating ? ` • ${m.pages.cart.updating}` : null}
                    </>
                  ) : (
                    <Skeleton height={14} width={160} />
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    removeCartLine(row.idx);
                    Toast.removeFromCart();
                  }}
                >
                  {m.common.remove}
                </Button>
              </div>
            </Card>
          ))}

          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-black/60">{m.pages.cart.total}</div>
              <div className="text-lg font-semibold">{formatPrice(cartTotal)}</div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2">
              <Link href="/checkout">
                <Button disabled={cart.length === 0}>{m.pages.cart.checkout}</Button>
              </Link>
            </div>
          </Card>
        </div>
      )}
      </FadeInSection>
    </div>
    </PageEnter>
  );
}
