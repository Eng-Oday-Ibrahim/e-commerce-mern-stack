/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { MarketingApi, type CouponDto } from "@/lib/api/marketing";
import { formatPrice, parsePrice } from "@/lib/utils/price";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";

function rowId(row: CouponDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingCouponsPage() {
  const router = useRouter();
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [percentOff, setPercentOff] = useState("10");
  const [fixedOff, setFixedOff] = useState("5.00");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.couponsList();
      setCoupons(res.coupons as CouponDto[]);
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
        <h1 className="text-xl font-semibold">Coupons</h1>
        <p className="text-sm text-black/60">Codes apply to order subtotal before shipping.</p>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Create coupon</div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="text-xs text-black/60 mb-1">Code</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="SAVE10" />
          </div>
          <div>
            <div className="text-xs text-black/60 mb-1">Type</div>
            <select
              className="h-11 w-full rounded border border-black/10 px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as "percent" | "fixed")}
            >
              <option value="percent">Percent off</option>
              <option value="fixed">Fixed amount off</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm pt-8">
            <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            Active
          </label>
        </div>
        {type === "percent" ? (
          <div className="max-w-xs">
            <div className="text-xs text-black/60 mb-1">Percent off (1–100)</div>
            <Input value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
          </div>
        ) : (
          <div className="max-w-xs">
            <div className="text-xs text-black/60 mb-1">Amount off (decimal)</div>
          <Input value={fixedOff} onChange={(e) => setFixedOff(e.target.value)} />
          </div>
        )}
        <div className="max-w-xs">
          <div className="text-xs text-black/60 mb-1">Minimum subtotal (decimal)</div>
          <Input value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} />
        </div>
        <Button
          disabled={!code.trim()}
          onClick={async () => {
            try {
              await MarketingApi.couponsCreate({
                code: code.trim(),
                type,
                ...(type === "percent"
                  ? { percentOff: Number.parseInt(percentOff, 10) || 0 }
                  : { fixedOff: parsePrice(fixedOff) }),
                minSubtotal: parsePrice(minSubtotal),
                isActive,
              } as CouponDto & Record<string, unknown>);
              Toast.success("Coupon created");
              setCode("");
              await load();
            } catch (e) {
              Toast.error(getApiErrorMessage(e));
            }
          }}
        >
          Save coupon
        </Button>
      </Card>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : (
          <DataTable
            data={coupons}
            getRowId={(r) => rowId(r)}
            columns={[
              { key: "code", header: "Code", render: (r) => String(r.code || "").toUpperCase() },
              { key: "type", header: "Type" },
              {
                key: "percentOff",
                header: "Value",
                render: (r) =>
                  r.type === "percent"
                    ? `${r.percentOff ?? 0}%`
                    : formatPrice((r as any).fixedOff ?? 0),
              },
              {
                key: "minSubtotal",
                header: "Min subtotal",
                render: (r) => formatPrice((r as any).minSubtotal ?? 0),
              },
              {
                key: "redemptionsCount",
                header: "Uses",
                render: (r) => `${r.redemptionsCount ?? 0}`,
              },
              {
                key: "isActive",
                header: "Active",
                render: (r) => {
                  const id = rowId(r);
                  return (
                    <Toggle
                      checked={r.isActive !== false}
                      disabled={!id || busyIds.has(id)}
                      onLabel="Active"
                      offLabel="Inactive"
                      aria-label={`Toggle coupon ${r.code}`}
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.couponsPatch(id, { isActive: next });
                          await load();
                        } catch (e) {
                          Toast.error(getApiErrorMessage(e));
                        } finally {
                          setBusyIds((prev) => {
                            const s = new Set(prev);
                            s.delete(id);
                            return s;
                          });
                        }
                      }}
                    />
                  );
                },
              },
            ]}
            renderActions={(r) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  type="button"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => router.push(`/dashboard/marketing/coupons/${rowId(r)}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Delete"
                  title="Delete"
                  onClick={async () => {
                    if (!confirm("Delete coupon?")) return;
                    try {
                      await MarketingApi.couponsDelete(rowId(r));
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
