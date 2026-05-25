/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { OrderService } from "@/lib/services/order.service";
import type { OrderDto } from "@/api/order";
import { formatPrice } from "@/lib/utils/price";
import { Eye } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardOrdersPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const res = await OrderService.listAdmin();
      setOrders(res.orders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Orders</h1>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : orders.length === 0 ? (
          <Empty
            variant="orders"
            title={m.pages.orders.empty}
            description={m.pages.orders.emptyDescription}
          />
        ) : (
          <DataTable
            data={orders}
            getRowId={(row) => row.id}
            columns={[
              { key: "orderNumber", header: "#" },
              {
                key: "status",
                header: "Status",
                render: (row) => (
                  <select
                    className="h-8 w-full rounded border border-black/10 px-2 text-xs bg-white"
                    value={row.status}
                    onChange={async (e) => {
                      await OrderService.updateStatus(row.id, e.target.value as OrderDto["status"]);
                      await load();
                    }}
                  >
                    {row.status !== "pending" &&
                    row.status !== "confirmed" &&
                    row.status !== "completed" &&
                    row.status !== "canceled" ? (
                      <option value={row.status} disabled>
                        {row.status}
                      </option>
                    ) : null}
                    <option value="pending">pending</option>
                    <option value="confirmed">confirmed</option>
                    <option value="completed">completed</option>
                    <option value="canceled">canceled</option>
                  </select>
                ),
              },
              {
                key: "paymentStatus",
                header: "Payment",
                render: (row) => row.paymentStatus,
              },
              {
                key: "shippingStatus",
                header: "Shipping",
                render: (row) => (
                  <select
                    className="h-8 w-full rounded border border-black/10 px-2 text-xs bg-white"
                    value={row.shippingStatus}
                    onChange={async (e) => {
                      await OrderService.updateShippingStatus(
                        row.id,
                        e.target.value as OrderDto["shippingStatus"]
                      );
                      await load();
                    }}
                  >
                    {row.shippingStatus !== "pending" &&
                    row.shippingStatus !== "shipped" &&
                    row.shippingStatus !== "out_for_delivery" &&
                    row.shippingStatus !== "delivered" &&
                    row.shippingStatus !== "returned" ? (
                      <option value={row.shippingStatus} disabled>
                        {row.shippingStatus}
                      </option>
                    ) : null}
                    <option value="pending">pending</option>
                    <option value="shipped">shipped</option>
                    <option value="out_for_delivery">out_for_delivery</option>
                    <option value="delivered">delivered</option>
                    <option value="returned">returned</option>
                  </select>
                ),
              },
              {
                key: "total",
                header: "Total",
                render: (row) => formatPrice((row as any).total ?? 0),
              },
              {
                key: "createdAt",
                header: "Created",
                render: (row) => (row.createdAt ? String(row.createdAt).slice(0, 10) : "—"),
              },
            ]}
            renderActions={(row) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="View"
                  title="View"
                  onClick={() => router.push(`/dashboard/orders/${row.id}`)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
