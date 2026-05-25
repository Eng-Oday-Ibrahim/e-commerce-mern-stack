/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { CustomerApi, type CustomerDto } from "@/lib/api/identity/customer";
import DataTable from "@/components/ui/DataTable";
import { formatPrice } from "@/lib/utils/price";

type OrderRow = {
  id: string;
  orderNumber: number;
  status: string;
  totalCents: number;
  currencyCode: string;
  createdAt: string;
};

export default function CustomerDetailPage({
  params,
}: {
  params: Promise<{ details: string }>;
}) {
  const { details: customerId } = use(params);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await CustomerApi.getAdminById(customerId);
        setCustomer(res.customer);
        setOrders((res.orders ?? []) as OrderRow[]);
      } finally {
        setLoading(false);
      }
    })();
  }, [customerId]);

  if (loading) return <div className="text-sm text-black/60 p-4">Loading...</div>;
  if (!customer) return <div className="text-sm p-4">Customer not found.</div>;

  return (
    <div className="space-y-4">
      <Link href="/dashboard/customers" className="text-sm text-black/60 hover:underline">
        ← Customers
      </Link>
      <h1 className="text-xl font-semibold">{customer.name}</h1>

      <Card className="p-4 space-y-2 text-sm">
        <div>
          <span className="text-black/60">Email:</span> {customer.email}
        </div>
        <div>
          <span className="text-black/60">Joined:</span>{" "}
          {customer.createdAt ? String(customer.createdAt).slice(0, 10) : "—"}
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h2 className="font-medium">Recent orders</h2>
        {orders.length === 0 ? (
          <div className="text-sm text-black/60">No orders.</div>
        ) : (
          <DataTable
            data={orders}
            getRowId={(row) => row.id}
            columns={[
              { key: "orderNumber", header: "#" },
              { key: "status", header: "Status" },
              {
                key: "totalCents",
                header: "Total",
                render: (row) =>
                  formatPrice((row as any).total ?? row.totalCents, { currencyCode: row.currencyCode }),
              },
              {
                key: "createdAt",
                header: "Date",
                render: (row) => String(row.createdAt).slice(0, 10),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
