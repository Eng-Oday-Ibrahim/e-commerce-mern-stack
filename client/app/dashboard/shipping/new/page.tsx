/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ShippingService } from "@/lib/services/shipping.service";
import { parsePrice } from "@/lib/utils/price";

export default function NewShippingCountryPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [taxFee, setTaxFee] = useState("0.00");
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Country</h1>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Country Name (EN)</div>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Country Name (AR)</div>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Tax Fee</div>
            <Input inputMode="decimal" value={taxFee} onChange={(e) => setTaxFee(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving || !nameEn.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                const res = await ShippingService.createCountry({
                  name: { en: nameEn.trim(), ar: nameAr.trim() },
                  taxFee: parsePrice(taxFee),
                  isActive,
                });
                router.replace(`/dashboard/shipping/${res.country.id}`);
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

