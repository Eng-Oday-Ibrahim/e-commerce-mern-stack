/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { MarketingApi, type AbandonedCartDto } from "@/lib/api/marketing";

export default function AbandonedCartDetailPage({
  params,
}: {
  params: Promise<{ details: string }>;
}) {
  const { details: id } = use(params);
  const [cart, setCart] = useState<AbandonedCartDto | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await MarketingApi.abandonedCartGet(id);
        setCart(res.cart as AbandonedCartDto);
      } catch {
        setCart(null);
      }
    })();
  }, [id]);

  if (!cart) return <div className="text-sm text-black/60 p-4">Loading or not found…</div>;

  return (
    <div className="space-y-4">
      <Link href="/dashboard/marketing/abandoned-carts" className="text-sm text-black/60 hover:underline">
        ← Abandoned carts
      </Link>
      <h1 className="text-xl font-semibold">Cart {cart.sessionKey}</h1>
      <Card className="p-4">
        <pre className="text-xs overflow-auto whitespace-pre-wrap">
          {JSON.stringify(cart.items ?? [], null, 2)}
        </pre>
      </Card>
    </div>
  );
}
