/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { MarketingApi, type AbandonedCartDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Bell, Eye } from "lucide-react";

function rowId(row: AbandonedCartDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingAbandonedCartsPage() {
  const [carts, setCarts] = useState<AbandonedCartDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.abandonedCartsList();
      setCarts(res.carts as AbandonedCartDto[]);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Abandoned carts</h1>
        <p className="text-sm text-black/60">
          Carts are upserted from the storefront when shoppers update items.{" "}
          <Link href="/dashboard/marketing" className="underline">
            Marketing home
          </Link>
        </p>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : (
          <DataTable
            data={carts}
            getRowId={(r) => rowId(r)}
            columns={[
              { key: "sessionKey", header: "Session" },
              {
                key: "items",
                header: "Lines",
                render: (r) => String(Array.isArray(r.items) ? r.items.length : 0),
              },
              {
                key: "remindersSent",
                header: "Reminders",
                render: (r) => String(r.remindersSent ?? 0),
              },
              {
                key: "updatedAt",
                header: "Updated",
                render: (r) => (r.updatedAt ? String(r.updatedAt).slice(0, 16) : "—"),
              },
            ]}
            renderActions={(r) => (
              <>
                <Link href={`/dashboard/marketing/abandoned-carts/${rowId(r)}`}>
                  <Button size="xs" variant="ghost" aria-label="Details" title="Details">
                    <Eye className="h-3.5 w-3.5" />
                  </Button>
                </Link>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Log reminder"
                  title="Log reminder"
                  onClick={async () => {
                    try {
                      await MarketingApi.abandonedCartRemind(rowId(r));
                      Toast.success("Reminder logged");
                      await load();
                    } catch (e) {
                      Toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  <Bell className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
