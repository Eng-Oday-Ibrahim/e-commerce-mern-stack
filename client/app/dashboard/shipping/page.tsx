/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ShippingService } from "@/lib/services/shipping.service";
import type { ShippingCountryDto } from "@/api/shipping";
import { formatPrice } from "@/lib/utils/price";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Toast } from "@/lib/utils/toast";
import { Edit2, Trash2 } from "lucide-react";
import { Toggle } from "@/components/ui/Toggle";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardShippingPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [countries, setCountries] = useState<ShippingCountryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ShippingService.listAllCountries();
      setCountries(res.countries);
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
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Shipping</h1>
          <p className="text-sm text-black/60">Countries with city count and tax fee.</p>
        </div>
        <Link href="/dashboard/shipping/new">
          <Button>New Country</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : countries.length === 0 ? (
          <Empty
            variant="products"
            title={m.pages.shipping.empty}
            description={m.pages.shipping.emptyDescription}
            actionLabel={m.pages.shipping.create}
            actionHref="/dashboard/shipping/new"
          />
        ) : (
          <DataTable
            data={countries}
            getRowId={(row) => row.id}
            columns={[
              { key: "name", header: "Country", render: (row) => row.name.en },
              {
                key: "citiesCount",
                header: "Cities",
                render: (row) => String((row as any).citiesCount ?? 0),
              },
              { key: "taxFee", header: "Tax Fee", render: (row) => formatPrice(row.taxFee) },
              {
                key: "isActive",
                header: "Active",
                render: (row) => (
                  <Toggle
                    checked={row.isActive}
                    disabled={busyIds.has(row.id)}
                    onLabel="Active"
                    offLabel="Inactive"
                    aria-label={`Toggle active for ${row.name.en}`}
                    onCheckedChange={async (next) => {
                      setBusyIds((prev) => new Set(prev).add(row.id));
                      try {
                        await ShippingService.updateCountry(row.id, { isActive: next });
                        await load();
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
            onRowClick={(row) => router.push(`/dashboard/shipping/${row.id}`)}
            renderActions={(row) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => router.push(`/dashboard/shipping/${row.id}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  title="Remove"
                  onClick={async () => {
                    if (!confirm("Delete this country and all its cities?")) return;
                    try {
                      await ShippingService.deleteCountry(row.id);
                      Toast.success("Deleted");
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
