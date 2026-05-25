/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { MarketingApi, type CouponDto, type OfferDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

function rowOfferId(o: OfferDto & { id?: string }) {
  return o.id ?? (o as any)._id ?? "";
}

function rowCouponId(c: CouponDto & { id?: string }) {
  return c.id ?? (c as any)._id ?? "";
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [coupons, setCoupons] = useState<CouponDto[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);
  const [offerSearch, setOfferSearch] = useState("");
  const [couponSearch, setCouponSearch] = useState("");
  const [selectedOfferIds, setSelectedOfferIds] = useState<Set<string>>(new Set());
  const [selectedCouponIds, setSelectedCouponIds] = useState<Set<string>>(new Set());

  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    try {
      const [o, c] = await Promise.all([MarketingApi.offersList(), MarketingApi.couponsList()]);
      setOffers((o.offers as OfferDto[]).map((x) => ({ ...x, targetIds: x.targetIds ?? [] })));
      setCoupons(c.coupons as CouponDto[]);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New campaign</h1>
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
            <div className="space-y-2 rounded border border-black/10 p-3">
              <div className="text-sm font-medium">Offers</div>
              <Input
                value={offerSearch}
                onChange={(e) => setOfferSearch(e.target.value)}
                placeholder="Search by name…"
                className="text-sm"
              />
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {filteredOffers.length === 0 ? (
                  <div className="text-xs text-black/60">No offers.</div>
                ) : (
                  filteredOffers.map((o) => {
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
                  })
                )}
              </div>
            </div>

            <div className="space-y-2 rounded border border-black/10 p-3">
              <div className="text-sm font-medium">Coupons</div>
              <Input
                value={couponSearch}
                onChange={(e) => setCouponSearch(e.target.value)}
                placeholder="Search by code…"
                className="text-sm"
              />
              <div className="max-h-52 overflow-y-auto space-y-2 pr-1">
                {filteredCoupons.length === 0 ? (
                  <div className="text-xs text-black/60">No coupons.</div>
                ) : (
                  filteredCoupons.map((c) => {
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
                        <span className="text-xs text-black/50">
                          {c.type === "percent" ? `${c.percentOff ?? 0}%` : "fixed"}
                        </span>
                      </label>
                    );
                  })
                )}
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
                await MarketingApi.campaignsCreate({
                  name: name.trim(),
                  slug: slug.trim().toLowerCase(),
                  description: description.trim(),
                  couponIds: Array.from(selectedCouponIds),
                  offerIds: Array.from(selectedOfferIds),
                  isActive,
                } as any);
                Toast.success("Campaign created");
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
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
