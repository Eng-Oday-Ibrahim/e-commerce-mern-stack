"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { OrderService } from "@/lib/services/order.service";
import { formatPrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { OrderDto } from "@/api/order";

export default function TrackOrderPage() {
  const { m } = useI18n();
  const [orderNumber, setOrderNumber] = useState("");
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    const numberValue = orderNumber.trim();
    if (!numberValue) {
      setError("Enter an order number to search.");
      setOrder(null);
      return;
    }

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await OrderService.trackByNumber(numberValue);
      setOrder(res.order);
    } catch (err) {
      setOrder(null);
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{m.pages.trackOrder.title}</h1>
      <p className="text-sm text-black/60">{m.pages.trackOrder.subtitle}</p>

      <Card className="p-4 space-y-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder={m.pages.trackOrder.orderNumberPlaceholder}
          />
          <Button onClick={handleSearch} disabled={loading}>
            {loading ? m.pages.trackOrder.checking : m.pages.trackOrder.trackButton}
          </Button>
        </div>

        {error ? <div className="text-sm text-red-600">{error}</div> : null}

        {order ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-black/10 p-4 bg-white shadow-sm">
              <div className="text-sm text-black/60">Order #{order.orderNumber}</div>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-black/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-black/40">Order status</div>
                  <div className="mt-2 text-sm font-medium">{order.status}</div>
                </div>
                <div className="rounded-lg bg-black/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-black/40">Payment</div>
                  <div className="mt-2 text-sm font-medium">{order.paymentStatus}</div>
                </div>
                <div className="rounded-lg bg-black/5 p-3">
                  <div className="text-[11px] uppercase tracking-[0.18em] text-black/40">Shipping</div>
                  <div className="mt-2 text-sm font-medium">{order.shippingStatus}</div>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-black/40">Total</div>
                <div className="mt-2 text-lg font-semibold">{formatPrice(order.total, { currencyCode: order.currencyCode })}</div>
              </div>
              <div className="rounded-2xl border border-black/10 p-4">
                <div className="text-[11px] uppercase tracking-[0.18em] text-black/40">Placed</div>
                <div className="mt-2 text-sm font-medium">{new Date(order.createdAt).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        ) : null}
      </Card>
    </div>
  );
}
