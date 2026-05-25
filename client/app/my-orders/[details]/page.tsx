"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils/price";import { getApiErrorMessage } from "@/lib/utils/apiError";import { OrderService } from "@/lib/services/order.service";
import type { OrderDto } from "@/api/order";

export default function AccountOrderDetailsPage({ 
  searchParams 
}: { 
  params: Promise<{ details: string }>
  searchParams: Promise<{ orderNumber?: string; phone?: string }>
}) {
  const queryParams = use(searchParams);
  const orderNumber = queryParams.orderNumber ? Number(queryParams.orderNumber) : undefined;
  const phone = queryParams.phone;
  
  const [order, setOrder] = useState<OrderDto | null>(null);
  const [loading, setLoading] = useState(!orderNumber);
  const [error, setError] = useState(orderNumber ? "" : "Order number not found.");

  useEffect(() => {
    if (!orderNumber) {
      return;
    }

    (async () => {
      setLoading(true);
      setError("");
      try {
        const res = await OrderService.trackByNumber(orderNumber, phone);
        setOrder(res.order);
      } catch (err) {
        setOrder(null);
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [orderNumber, phone]);

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-4">
      <Link className="text-sm underline" href="/my-orders">
        Back to orders
      </Link>
      {loading ? (
        <Card className="p-4 text-sm text-black/60">Loading...</Card>
      ) : error ? (
        <Card className="p-4 text-sm text-red-600">{error}</Card>
      ) : !order ? (
        <Card className="p-4 text-sm text-black/60">Order not found.</Card>
      ) : (
        <Card className="p-6 space-y-2">
          <h1 className="text-xl font-semibold">Order #{order.orderNumber}</h1>
          <div className="text-sm text-black/70">Status: {order.status}</div>
          <div className="text-sm text-black/70">Payment: {order.paymentStatus}</div>
          <div className="text-sm text-black/70">Shipping: {order.shippingStatus}</div>
          <div className="text-sm text-black/70">Subtotal: {formatPrice(order.subtotal)}</div>
          {order.discount ? (
            <div className="text-sm text-black/70">Discount: -{formatPrice(order.discount)}</div>
          ) : null}
          <div className="text-sm text-black/70">Shipping fee: {formatPrice(order.shippingFee)}</div>
          {typeof order.taxAmount === "number" ? (
            <div className="text-sm text-black/70">{order.taxLabel || "Tax"}: {formatPrice(order.taxAmount)}</div>
          ) : null}
          <div className="text-base font-medium">Total: {formatPrice(order.total)}</div>
        </Card>
      )}
    </div>
  );
}
