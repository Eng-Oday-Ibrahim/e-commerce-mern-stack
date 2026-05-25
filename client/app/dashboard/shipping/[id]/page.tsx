"use client";

import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import DataTable from "@/components/ui/DataTable";
import { Toggle } from "@/components/ui/Toggle";
import { ShippingService } from "@/lib/services/shipping.service";
import type { ShippingCityDto, ShippingCountryDto } from "@/api/shipping";
import { formatPrice, parsePrice } from "@/lib/utils/price";
import { Edit2, Trash2 } from "lucide-react";

export default function EditShippingCountryPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  function coerceNumber(value: unknown): number {
    if (typeof value === "number") return Number.isFinite(value) ? value : 0;
    if (typeof value === "string") {
      const n = Number(value);
      return Number.isFinite(n) ? n : 0;
    }
    if (value && typeof value === "object") {
      const rec = value as Record<string, unknown>;
      const dec = rec["$numberDecimal"];
      if (typeof dec === "string") {
        const n = Number(dec);
        return Number.isFinite(n) ? n : 0;
      }
      const maybeToString = (value as { toString?: () => string }).toString;
      if (typeof maybeToString === "function") {
        const n = Number(maybeToString.call(value));
        return Number.isFinite(n) ? n : 0;
      }
    }
    return 0;
  }

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [country, setCountry] = useState<ShippingCountryDto | null>(null);
  const [cities, setCities] = useState<ShippingCityDto[]>([]);

  const [nameEn, setNameEn] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [taxFee, setTaxFee] = useState("0.00");
  const [isActive, setIsActive] = useState(true);

  const [cityNameEn, setCityNameEn] = useState("");
  const [cityNameAr, setCityNameAr] = useState("");
  const [cityPrice, setCityPrice] = useState("0.00");
  const [cityIsActive, setCityIsActive] = useState(true);
  const [savingCity, setSavingCity] = useState(false);
  const [busyCityIds, setBusyCityIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [countryRes, citiesRes] = await Promise.all([
        ShippingService.getCountry(id),
        ShippingService.listCitiesByCountry(id),
      ]);
      setCountry(countryRes.country);
      setCities(citiesRes.cities);
      setNameEn(countryRes.country.name.en);
      setNameAr(countryRes.country.name.ar);
      setTaxFee(coerceNumber(countryRes.country.taxFee ?? 0).toFixed(2));
      setIsActive(countryRes.country.isActive);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!country) return <div className="text-sm text-black/60">Country not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Shipping: {country.name.en}</h1>
          <div className="text-sm text-black/60">{country.id}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/dashboard/shipping">
            <Button variant="ghost">Back</Button>
          </Link>
        </div>
      </div>

      <Card className="p-6 space-y-4">
        <div className="font-medium">Country</div>
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
                await ShippingService.updateCountry(id, {
                  name: { en: nameEn.trim(), ar: nameAr.trim() },
                  taxFee: parsePrice(taxFee),
                  isActive,
                });
                await load();
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div className="font-medium">New City</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">City Name (EN)</div>
            <Input value={cityNameEn} onChange={(e) => setCityNameEn(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">City Name (AR)</div>
            <Input value={cityNameAr} onChange={(e) => setCityNameAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Shipping Price</div>
            <Input inputMode="decimal" value={cityPrice} onChange={(e) => setCityPrice(e.target.value)} />
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={cityIsActive} onChange={(e) => setCityIsActive(e.target.checked)} />
              Active
            </label>
          </div>
        </div>
        <Button
          disabled={savingCity || !cityNameEn.trim()}
          onClick={async () => {
            setSavingCity(true);
            try {
              await ShippingService.createCity({
                countryId: id,
                name: { en: cityNameEn.trim(), ar: cityNameAr.trim() },
                price: parsePrice(cityPrice),
                isActive: cityIsActive,
              });
              setCityNameEn("");
              setCityNameAr("");
              setCityPrice("0.00");
              setCityIsActive(true);
              await load();
            } finally {
              setSavingCity(false);
            }
          }}
        >
          {savingCity ? "Saving..." : "Add city"}
        </Button>
      </Card>

      <Card className="p-4">
        <DataTable
          data={cities}
          getRowId={(row) => row.id}
          columns={[
            { key: "name", header: "City", render: (row) => row.name.en },
            { key: "price", header: "Shipping Price", render: (row) => formatPrice(row.price) },
            {
              key: "isActive",
              header: "Active",
              render: (row) => (
                <Toggle
                  checked={row.isActive}
                  disabled={busyCityIds.has(row.id)}
                  onLabel="Active"
                  offLabel="Inactive"
                  aria-label={`Toggle active for ${row.name.en}`}
                  onCheckedChange={async (next) => {
                    setBusyCityIds((prev) => new Set(prev).add(row.id));
                    try {
                      await ShippingService.updateCity(row.id, { isActive: next });
                      await load();
                    } finally {
                      setBusyCityIds((prev) => {
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
                onClick={() => router.push(`/dashboard/shipping/cities/${row.id}`)}
              >
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                aria-label="Remove"
                title="Remove"
                onClick={async () => {
                  if (!confirm("Delete this city?")) return;
                  await ShippingService.deleteCity(row.id);
                  await load();
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        />
      </Card>
    </div>
  );
}
