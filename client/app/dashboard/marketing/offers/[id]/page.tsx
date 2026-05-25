/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type OfferDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function EditOfferPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [offer, setOffer] = useState<OfferDto | null>(null);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.offersList();
      const row = (res.offers as OfferDto[]).find((o) => (o.id ?? (o as any)._id) === id);
      if (!row) {
        setOffer(null);
        return;
      }
      setOffer(row);
      setName(row.name ?? "");
      setIsActive(row.isActive !== false);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
      setOffer(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="text-sm text-black/60 p-6">Loading…</div>;
  if (!offer) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-sm">Offer not found.</p>
        <Link href="/dashboard/marketing/offers" className="text-sm underline">
          Back to offers
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-lg">
      <Link href="/dashboard/marketing/offers" className="text-sm text-black/60 hover:underline">
        ← Offers
      </Link>
      <h1 className="text-xl font-semibold">Edit offer</h1>
      <Card className="p-6 space-y-4">
        <div>
          <div className="text-xs text-black/60 mb-1">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="text-xs text-black/60">
          Targets ({offer.targetType}): {(offer.targetIds ?? []).length} selected — recreate the offer to change
          targets.
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm">Active</span>
          <Toggle checked={isActive} onCheckedChange={setIsActive} onLabel="On" offLabel="Off" />
        </div>
        <div className="flex gap-2">
          <Button
            disabled={saving || !name.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                await MarketingApi.offersPatch(id, { name: name.trim(), isActive });
                Toast.success("Saved");
                router.replace("/dashboard/marketing/offers");
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button variant="ghost" type="button" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
