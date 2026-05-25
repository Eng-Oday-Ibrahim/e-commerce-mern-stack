/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { ShippingService } from "@/lib/services/shipping.service";
import { parsePrice } from "@/lib/utils/price";

export default function EditShippingCityPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [countryId, setCountryId] = useState<string>("");
  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [price, setPrice] = useState("0.00");
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await ShippingService.getCity(id);
        const c = res.city;
        setCountryId(c.countryId);
        setNameEn(c.name.en);
        setNameAr(c.name.ar);
        setPrice((c.price ?? 0).toFixed(2));
        setIsActive(c.isActive);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit City</h1>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Name (EN)</div>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Name (AR)</div>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Shipping Price</div>
            <Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} />
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
                await ShippingService.updateCity(id, {
                  name: { en: nameEn.trim(), ar: nameAr.trim() },
                  price: parsePrice(price),
                  isActive,
                });
                router.replace(`/dashboard/shipping/${countryId}`);
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

