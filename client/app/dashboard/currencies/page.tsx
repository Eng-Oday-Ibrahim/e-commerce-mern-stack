/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { CurrencyService } from "@/lib/services/currency.service";
import type { CurrencyDto } from "@/api/currency";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardCurrenciesPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [currencies, setCurrencies] = useState<CurrencyDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = async () => {
    setLoading(true);
    try {
      const res = await CurrencyService.listAll();
      setCurrencies(res.currencies);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Currencies</h1>
        <Link href="/dashboard/currencies/new">
          <Button>New Currency</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : currencies.length === 0 ? (
          <Empty
            variant="products"
            title={m.pages.currencies.empty}
            description={m.pages.currencies.emptyDescription}
            actionLabel={m.pages.currencies.create}
            actionHref="/dashboard/currencies/new"
          />
        ) : (
          <DataTable
            data={currencies}
            getRowId={(row) => row.id}
            columns={[
              { key: "name", header: "Name" },
              { key: "symbol", header: "Symbol", render: (row) => row.symbol || "-" },
              { key: "isDefault", header: "Default", render: (row) => (row.isDefault ? "Yes" : "No") },
              {
                key: "isActive",
                header: "Active",
                render: (row) => (
                  <Toggle
                    checked={row.isActive}
                    disabled={busyIds.has(row.id)}
                    onLabel="Active"
                    offLabel="Inactive"
                    aria-label={`Toggle active for ${row.name}`}
                    onCheckedChange={async (next) => {
                      setBusyIds((prev) => new Set(prev).add(row.id));
                      try {
                        await CurrencyService.update(row.id, { isActive: next });
                        await load();
                      } catch (e) {
                        Toast.error(getApiErrorMessage(e));
                      } finally {
                        setBusyIds((prev) => {
                          const s = new Set(prev);
                          s.delete(row.id);
                          return s;
                        });
                      }
                    }}
                  />
                ),
              },
            ]}
            renderActions={(row) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => router.push(`/dashboard/currencies/${row.id}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  title="Remove"
                  onClick={async () => {
                    if (!confirm("Delete this currency?")) return;
                    try {
                      await CurrencyService.delete(row.id);
                      await load();
                    } catch (e) {
                      Toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
