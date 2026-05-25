/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { MarketingApi, type CampaignDto, type CouponDto, type OfferDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

function rowOfferId(o: OfferDto & { id?: string }) {
  return o.id ?? (o as any)._id ?? "";
}

function rowCouponId(c: CouponDto & { id?: string }) {
  return c.id ?? (c as any)._id ?? "";
}

function campaignRowId(c: CampaignDto & { id?: string }) {
  return c.id ?? (c as any)._id ?? "";
}

export default function EditCampaignPage({ params }: { params: Promise<{ edit: string }> }) {
  const { edit: campaignId } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [offerSearch, setOfferSearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<string>>(new Set());
  const [selectedCouponIds, setSelectedCouponIds] = useState<Set<string>>(new Set());

  const loadAll = useCallback(async () => {
    setLoading(true);
    setRefsLoading(true);
    try {
      const [campRes, o, c] = await Promise.all([
        MarketingApi.campaignsList(),
        MarketingApi.offersList(),
        MarketingApi.couponsList(),
      ]);
      const campaign = (campRes.campaigns as CampaignDto[]).find(
        (x) => campaignRowId(x) === campaignId
      );
      if (!campaign) {
        setNotFound(true);
        return;
      }
      setNotFound(false);
      setName(campaign.name ?? "");
      setSlug(campaign.slug ?? "");
      setDescription(campaign.description ?? "");
      setIsActive(campaign.isActive !== false);
      setSelectedOfferIds(new Set(campaign.offerIds ?? []));
      setSelectedCouponIds(new Set(campaign.couponIds ?? []));

      setOffers((o.offers as OfferDto[]).map((x) => ({ ...x, targetIds: x.targetIds ?? [] })));
      setCoupons(c.coupons as CouponDto[]);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefsLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filteredOffers = useMemo(() => {
    const q = offerSearch.trim().toLowerCase();
    if (!q) return offers;
    return offers.filter((x) => (x.name ?? "").toLowerCase().includes(q));
  }, [offers, offerSearch]);

  const filteredCoupons = useMemo(() => {
    const q = couponSearch.trim().toLowerCase();
    if (!q) return coupons;
    return coupons.filter((x) => String(x.code ?? "").toLowerCase().includes(q));
  }, [coupons, couponSearch]);

  if (loading) return <div className="text-sm text-black/60 p-6">Loading…</div>;
  if (notFound) {
    return (
      <div className="p-6 space-y-2">
        <p className="text-sm">Campaign not found.</p>
        <Link href="/dashboard/marketing/campaigns" className="text-sm underline">
          Back to campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/marketing/campaigns" className="text-sm text-black/60 hover:underline">
        ← Campaigns
      </Link>
      <h1 className="text-xl font-semibold">Edit campaign</h1>
      <Card className="p-6 space-y-4">
        <div>
          <div className="text-sm mb-1">Name</div>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <div className="text-sm mb-1">Slug</div>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="summer-sale" />
        </div>
        <div>
          <div className="text-sm mb-1">Description</div>
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        {refsLoading ? (
          <div className="text-sm text-black/60">Loading offers and coupons…</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="space-y-2 rounded border border-black/10 p-3 max-h-72 overflow-hidden flex flex-col">
              <div className="text-sm font-medium">Offers</div>
              <Input
                value={offerSearch}
                onChange={(e) => setOfferSearch(e.target.value)}
                placeholder="Search by name…"
                className="text-sm"
              />
              <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                {filteredOffers.map((o) => {
                  const id = rowOfferId(o);
                  if (!id) return null;
                  return (
                    <label key={id} className="flex items-start gap-2 text-sm cursor-pointer">
                      <Checkbox
                        className="mt-0.5"
                        checked={selectedOfferIds.has(id)}
                        onChange={(e) => {
                          setSelectedOfferIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(id);
                            else next.delete(id);
                            return next;
                          });
                        }}
                      />
                      <span>
                        <span className="font-medium">{o.name}</span>
                        <span className="block text-xs text-black/50">
                          {o.targetType} · {o.percentOff != null ? `${o.percentOff}%` : "fixed"}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 rounded border border-black/10 p-3 max-h-72 overflow-hidden flex flex-col">
              <div className="text-sm font-medium">Coupons</div>
              <Input
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                placeholder="Search by code…"
                className="text-sm"
              />
              <div className="overflow-y-auto space-y-2 pr-1 flex-1">
                {filteredCoupons.map((c) => {
                  const id = rowCouponId(c);
                  if (!id) return null;
                  return (
                    <label key={id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={selectedCouponIds.has(id)}
                        onChange={(e) => {
                          setSelectedCouponIds((prev) => {
                            const next = new Set(prev);
                            if (e.target.checked) next.add(id);
                            else next.delete(id);
                            return next;
                          });
                        }}
                      />
                      <span className="font-mono uppercase">{c.code}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2 pt-2">
          <Button
            disabled={saving || !name.trim() || !slug.trim()}
            onClick={async () => {
              setSaving(true);
              try {
                await MarketingApi.campaignsPatch(campaignId, {
                  name: name.trim(),
                  slug: slug.trim().toLowerCase(),
                  description: description.trim(),
                  couponIds: Array.from(selectedCouponIds),
                  offerIds: Array.from(selectedOfferIds),
                  isActive,
                });
                Toast.success("Campaign updated");
                router.replace("/dashboard/marketing/campaigns");
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
