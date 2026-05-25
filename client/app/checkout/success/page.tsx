"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { clearCart } from "@/lib/utils/storeCart";
import { OrderService } from "@/lib/services/order.service";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function CheckoutSuccessPage() {
  const { m } = useI18n();
  const search = useSearchParams();
  const orderId = useMemo(() => search.get("orderId") || "", [search]);
  const accessToken = useMemo(() => search.get("accessToken") || "", [search]);
  const [status, setStatus] = useState<"loading" | "paid" | "pending" | "failed">("loading");

  useEffect(() => {
    let canceled = false;

    async function run() {
      if (!orderId) {
        setStatus("pending");
        return;
      }

      const startedAt = Date.now();
      const timeoutMs = 30_000;
      while (!canceled && Date.now() - startedAt < timeoutMs) {
        try {
          const res = accessToken
            ? await OrderService.getPublicById(orderId, accessToken)
            : await OrderService.getMineById(orderId);
          const paymentStatus = res.order.paymentStatus;
          if (paymentStatus === "paid") {
            setStatus("paid");
            clearCart();
            return;
          }
          if (paymentStatus === "failed") {
            setStatus("failed");
            return;
          }
          setStatus("pending");
        } catch {
          setStatus("pending");
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
    }

    run();
    return () => {
      canceled = true;
    };
  }, [orderId, accessToken]);

  return (
    <div className="mx-auto max-w-3xl p-6">
      <Card className="p-6 space-y-3">
        <h1 className="text-2xl font-semibold">
          {status === "paid" ? m.pages.checkoutSuccess.title : m.pages.checkoutSuccess.subtitle}
        </h1>
        <p className="text-sm text-black/70">
          {status === "paid"
            ? m.pages.checkoutSuccess.orderDetails
            : status === "failed"
              ? m.pages.checkoutSuccess.paymentFailed
              : m.pages.checkoutSuccess.paymentPending}
        </p>
        <div className="flex gap-2">
          <Link href="/my-orders">
            <Button>{m.pages.checkoutSuccess.myOrders}</Button>
          </Link>
          <Link href="/shop">
            <Button variant="outline">{m.pages.checkoutSuccess.continueShopping}</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
