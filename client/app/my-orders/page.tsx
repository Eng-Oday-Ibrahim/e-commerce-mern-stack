"use client";

import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { formatPrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { OrderService } from "@/lib/services/order.service";
import type { OrderDto } from "@/api/order";
import Empty from "@/components/ui/Empty";

export default function AccountOrdersPage() {
  const { m } = useI18n();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [searchPhone, setSearchPhone] = useState("");
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!searchPhone.trim()) {
      setError(m.pages.orders.enterOrderNumber);
      return;
    }
    setSearching(true);
    setError("");
    try {
      const res = await OrderService.searchByPhone(searchPhone.trim());
      setOrders(res.orders);
    } catch (err) {
      setOrders([]);
      setError(getApiErrorMessage(err));
    } finally {
      setSearching(false);
    }
  };

  const clearSearch = async () => {
    setSearchPhone("");
    setOrders([]);
  };

  return (
    <div className="mx-auto max-w-4xl p-6 space-y-4">
      <h1 className="text-2xl font-semibold">{m.pages.orders.title}</h1>
      <Card className="p-4 space-y-4">
        <div className="text-sm font-medium">{m.pages.orders.searchHeading}</div>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <Input
            value={searchPhone}
            onChange={(e) => setSearchPhone(e.target.value)}
            placeholder={m.pages.orders.orderNumberPlaceholder}
          />
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? m.pages.orders.checking : m.pages.orders.search}
            </Button>
            <Button variant="outline" onClick={clearSearch} disabled={searching || !searchPhone}>
              {m.pages.orders.clear}
            </Button>
          </div>
        </div>
        <p className="text-sm text-black/60">
          {m.pages.orders.instructions}
        </p>
      </Card>

      {error ? (
        <Card className="p-4 text-sm text-red-600">{error}</Card>
      ) : null}

      {!searching && !error && orders.length === 0 ? (
        <Empty
          variant="orders"
          title={searchPhone ? m.pages.orders.noOrdersFound : m.pages.orders.searchTitle}
          description={searchPhone ? m.pages.orders.noOrdersMatch : m.pages.orders.searchDescription}
          actionLabel={m.common.continueShopping}
          actionHref="/shop"
        />
      ) : orders.length > 0 ? (
        <div className="space-y-3">
          {orders.map((o) => (
            <Card key={o.id} className="p-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm">
                <div className="font-medium">Order #{o.orderNumber}</div>
                <div className="text-black/60">
                  {o.status} • payment {o.paymentStatus} • shipping {o.shippingStatus}
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium">{formatPrice(o.total)}</div>
                <Link className="text-sm underline" href={`/my-orders/${o.id}?orderNumber=${o.orderNumber}&phone=${encodeURIComponent(searchPhone)}`}>
                  Details
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
