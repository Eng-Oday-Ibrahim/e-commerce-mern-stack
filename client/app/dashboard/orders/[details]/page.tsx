/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OrderService } from "@/lib/services/order.service";
import type { OrderDto } from "@/api/order";
import { formatPrice } from "@/lib/utils/price";

type AdminOrderDetails = OrderDto & {
  customer?: { id: string; email?: string; name?: string };
  items?: Array<{
    productId: string;
    productSlug: string;
    productName: { ar: string; en: string };
    quantity: number;
    unitPrice: number;
  }>;
  shippingAddress?: {
    fullName: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
  };
  shipping?: {
    countryName?: { ar: string; en: string };
    cityName?: { ar: string; en: string };
    price?: number;
  };
};

export default function DashboardOrderDetailsPage({
  params,
}: {
  params: Promise<{ details: string }>;
}) {
  const router = useRouter();
  const { details: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await OrderService.getAdminById(id);
      setOrder(res.order as AdminOrderDetails);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const itemsTotal = useMemo(() => {
    const items = order?.items ?? [];
    return items.reduce((sum, it) => sum + (Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), 0);
  }, [order]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!order) return <div className="text-sm text-black/60">Order not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Order #{order.orderNumber}</h1>
          <div className="text-sm text-black/60">{order.id}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <div className="text-sm text-black/60 mb-1">Status</div>
            <select
              className="h-10 w-full rounded border border-black/10 px-3 text-sm bg-white"
              value={order.status}
              onChange={async (e) => {
                await OrderService.updateStatus(order.id, e.target.value as OrderDto["status"]);
                await load();
              }}
            >
              <option value="pending">pending</option>
              <option value="confirmed">confirmed</option>
              <option value="processing">processing</option>
              <option value="completed">completed</option>
              <option value="canceled">canceled</option>
              <option value="refunded">refunded</option>
            </select>
          </div>

          <div>
            <div className="text-sm text-black/60 mb-1">Payment status</div>
            <select
              className="h-10 w-full rounded border border-black/10 px-3 text-sm bg-white"
              value={order.paymentStatus}
              onChange={async (e) => {
                await OrderService.updatePaymentStatus(
                  order.id,
                  e.target.value as OrderDto["paymentStatus"]
                );
                await load();
              }}
            >
              <option value="pending">pending</option>
              <option value="paid">paid</option>
              <option value="failed">failed</option>
              <option value="refunded">refunded</option>
              <option value="partially_refunded">partially_refunded</option>
            </select>
            <div className="text-xs text-black/50 mt-1">
              If Stripe is enabled, this is usually updated automatically by webhooks.
            </div>
          </div>

          <div>
            <div className="text-sm text-black/60 mb-1">Shipping status</div>
            <select
              className="h-10 w-full rounded border border-black/10 px-3 text-sm bg-white"
              value={order.shippingStatus}
              onChange={async (e) => {
                await OrderService.updateShippingStatus(
                  order.id,
                  e.target.value as OrderDto["shippingStatus"]
                );
                await load();
              }}
            >
              <option value="pending">pending</option>
              <option value="packed">packed</option>
              <option value="shipped">shipped</option>
              <option value="out_for_delivery">out_for_delivery</option>
              <option value="delivered">delivered</option>
              <option value="returned">returned</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="font-medium">Customer</div>
            <div className="text-sm">{order.customer?.email ?? "—"}</div>
            {order.customer?.name ? <div className="text-sm text-black/60">{order.customer.name}</div> : null}
          </div>

          <div className="space-y-2">
            <div className="font-medium">Shipping address</div>
            {order.shippingAddress ? (
              <div className="text-sm text-black/80 whitespace-pre-line">
                {order.shippingAddress.fullName}
                {"\n"}
                {order.shippingAddress.phone}
                {"\n"}
                {order.shippingAddress.line1}
                {order.shippingAddress.line2 ? `\n${order.shippingAddress.line2}` : ""}
                {"\n"}
                {order.shippingAddress.city}
                {order.shippingAddress.state ? `, ${order.shippingAddress.state}` : ""}
                {order.shippingAddress.postalCode ? ` ${order.shippingAddress.postalCode}` : ""}
                {"\n"}
                {order.shippingAddress.country}
              </div>
            ) : (
              <div className="text-sm text-black/60">—</div>
            )}
          </div>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="font-medium">Items</div>
        <div className="space-y-3">
          {(order.items ?? []).map((it, idx) => (
            <div
              key={`${it.productId}-${idx}`}
              className="flex items-center justify-between gap-3 flex-wrap border border-black/10 rounded p-3"
            >
              <div className="min-w-0">
                <div className="font-medium truncate">{it.productName?.en ?? it.productSlug}</div>
                <div className="text-sm text-black/60 truncate">{it.productId}</div>
              </div>
              <div className="text-sm">
                {it.quantity} × {formatPrice(Number(it.unitPrice) || 0, { currencyCode: order.currencyCode })}
              </div>
              <div className="text-sm font-medium">
                {formatPrice((Number(it.unitPrice) || 0) * (Number(it.quantity) || 0), {
                  currencyCode: order.currencyCode,
                })}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-6 space-y-2">
        <div className="font-medium">Totals</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          <div className="flex items-center justify-between gap-2">
            <span className="text-black/60">Items subtotal</span>
            <span>{formatPrice(order.subtotal ?? itemsTotal, { currencyCode: order.currencyCode })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-black/60">Discount</span>
            <span>{formatPrice(order.discount ?? 0, { currencyCode: order.currencyCode })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-black/60">Shipping</span>
            <span>{formatPrice(order.shippingFee ?? 0, { currencyCode: order.currencyCode })}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-black/60">{order.taxLabel ?? "Tax"}</span>
            <span>{formatPrice(order.taxAmount ?? 0, { currencyCode: order.currencyCode })}</span>
          </div>
          <div className="flex items-center justify-between gap-2 sm:col-span-2 border-t border-black/10 pt-2">
            <span className="text-black/60">Total</span>
            <span className="font-semibold">
              {formatPrice(order.total ?? 0, { currencyCode: order.currencyCode })}
            </span>
          </div>
        </div>
      </Card>
    </div>
  );
}
