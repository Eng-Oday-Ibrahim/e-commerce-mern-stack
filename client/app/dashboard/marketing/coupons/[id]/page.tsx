/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { MarketingApi, type CouponDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { parsePrice } from "@/lib/utils/price";

function priceToInput(value: number | undefined) {
  if (value == null || !Number.isFinite(value)) return "0.00";
  return Number(value).toFixed(2);
}

export default function EditCouponPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed">("percent");
  const [percentOff, setPercentOff] = useState("10");
  const [fixedDecimal, setFixedDecimal] = useState("5.00");
  const [minSubtotal, setMinSubtotal] = useState("0");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const res = await MarketingApi.couponsGet(id);
        if (cancelled) return;
        const c = res.coupon as CouponDto;
        setCode(c.code ?? "");
        setType(c.type);
        setPercentOff(String(c.percentOff ?? 10));
        setFixedDecimal(priceToInput(c.fixedOff));
        setMinSubtotal(priceToInput(c.minSubtotal));
        setIsActive(c.isActive !== false);
      } catch (e) {
        if (!cancelled) Toast.error(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-4 max-w-xl">
        <div className="text-sm text-black/60">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-xl">
      <div className="flex items-center gap-3">
        <Link href="/dashboard/marketing/coupons" className="text-sm text-black/60 hover:underline">
          ← Coupons
        </Link>
      </div>
      <h1 className="text-xl font-semibold">Edit coupon</h1>
      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <div className="text-xs text-black/60 mb-1">Code</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
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
        </div>

        {type === "percent" ? (
          <div className="max-w-xs">
            <div className="text-xs text-black/60 mb-1">Percent off (1–100)</div>
            <Input value={percentOff} onChange={(e) => setPercentOff(e.target.value)} />
          </div>
        ) : (
          <div className="max-w-xs">
            <div className="text-xs text-black/60 mb-1">Amount off (decimal)</div>
            <Input value={fixedDecimal} onChange={(e) => setFixedDecimal(e.target.value)} />
          </div>
        )}

        <div className="max-w-xs">
          <div className="text-xs text-black/60 mb-1">Minimum subtotal (decimal)</div>
          <Input value={minSubtotal} onChange={(e) => setMinSubtotal(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        <div className="flex gap-2">
          <Button
            disabled={saving || !code.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                await MarketingApi.couponsPatch(id, {
                  code: code.trim(),
                  type,
                  ...(type === "percent"
                    ? { percentOff: Number.parseInt(percentOff, 10) || 0, fixedOff: undefined }
                    : { fixedOff: parsePrice(fixedDecimal), percentOff: undefined }),
                  minSubtotal: parsePrice(minSubtotal),
                  isActive,
                } as Partial<CouponDto>);
                Toast.success("Coupon updated");
                router.replace("/dashboard/marketing/coupons");
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save changes"}
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
