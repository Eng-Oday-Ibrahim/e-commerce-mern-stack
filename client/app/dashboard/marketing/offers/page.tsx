/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { MarketingApi, type OfferDto } from "@/lib/api/marketing";
import type { CategoryDto, CollectionDto, ProductDto } from "@/lib/api/catalog/types";
import { CollectionService } from "@/lib/services/catalog/collection.service";
import { CategoryService } from "@/lib/services/catalog/category.service";
import { ProductService } from "@/lib/services/catalog/product.service";
import { formatPrice, parsePrice } from "@/lib/utils/price";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";

function rowId(row: OfferDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

function toggleId(set: Set<string>, id: string, on: boolean) {
  const next = new Set(set);
  if (on) next.add(id);
  else next.delete(id);
  return next;
}

export default function MarketingOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<OfferDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const [collections, setCollections] = useState<CollectionDto[]>([]);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);

  const [name, setName] = useState("");
  const [targetType, setTargetType] = useState<"product" | "collection" | "category">("collection");
  const [selectedCollectionIds, setSelectedCollectionIds] = useState<Set<string>>(new Set());
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<Set<string>>(new Set());
  const [selectedProductIds, setSelectedProductIds] = useState<Set<string>>(new Set());
  const [productSearch, setProductSearch] = useState("");

  const [discountKind, setDiscountKind] = useState<"percent" | "fixed">("percent");
  const [discountValue, setDiscountValue] = useState("15");

  const loadOffers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.offersList();
      setOffers((res.offers as OfferDto[]).map((o) => ({ ...o, targetIds: o.targetIds ?? [] })));
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRefs = useCallback(async () => {
    setRefsLoading(true);
    try {
      const [cols, cats, prods] = await Promise.all([
        CollectionService.listAdmin(),
        CategoryService.listAdmin(),
        ProductService.listAdmin(),
      ]);
      setCollections(cols.collections ?? []);
      setCategories(cats.categories ?? []);
      setProducts(prods.products ?? []);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setRefsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOffers();
  }, [loadOffers]);

  useEffect(() => {
    loadRefs();
  }, [loadRefs]);

  useEffect(() => {
    setSelectedCollectionIds(new Set());
    setSelectedCategoryIds(new Set());
    setSelectedProductIds(new Set());
    setProductSearch("");
  }, [targetType]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const en = (p.name?.en ?? "").toLowerCase();
      const ar = (p.name?.ar ?? "").toLowerCase();
      return en.includes(q) || ar.includes(q);
    });
  }, [products, productSearch]);

  const selectedTargetIds = useMemo(() => {
    if (targetType === "collection") return Array.from(selectedCollectionIds);
    if (targetType === "category") return Array.from(selectedCategoryIds);
    return Array.from(selectedProductIds);
  }, [targetType, selectedCollectionIds, selectedCategoryIds, selectedProductIds]);

  const canSave =
    name.trim().length > 0 &&
    selectedTargetIds.length > 0 &&
    discountValue.trim().length > 0 &&
    (discountKind === "percent"
      ? Number.parseInt(discountValue, 10) >= 1 && Number.parseInt(discountValue, 10) <= 100
      : Number.isFinite(Number.parseFloat(discountValue.replace(",", "."))));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Offers</h1>
        <p className="text-sm text-black/60">
          Discount rules for products, collections, or categories (checkout can apply these later).
        </p>
      </div>

      <Card className="p-4 space-y-3">
        <div className="text-sm font-medium">Create offer</div>
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />

        <div>
          <div className="text-xs text-black/60 mb-1">Apply to</div>
          <select
            className="h-11 w-full rounded border border-black/10 px-3 text-sm max-w-md"
            value={targetType}
            onChange={(e) => setTargetType(e.target.value as typeof targetType)}
          >
            <option value="collection">Collection (pick one or more)</option>
            <option value="category">Category (pick one or more)</option>
            <option value="product">Product (search and pick one or more)</option>
          </select>
        </div>

        {refsLoading ? (
          <div className="text-sm text-black/60">Loading catalog…</div>
        ) : targetType === "collection" ? (
          <div className="space-y-2 max-h-56 overflow-y-auto rounded border border-black/10 p-3">
            {collections.length === 0 ? (
              <div className="text-sm text-black/60">No collections.</div>
            ) : (
              collections.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                  <Checkbox
                    checked={selectedCollectionIds.has(c.id)}
                    onChange={(e) =>
                      setSelectedCollectionIds((prev) => toggleId(prev, c.id, e.target.checked))
                    }
                  />
                  <span>{c.name?.en ?? c.slug}</span>
                </label>
              ))
            )}
          </div>
        ) : targetType === "category" ? (
          <div className="space-y-2 max-h-56 overflow-y-auto rounded border border-black/10 p-3">
            {categories.length === 0 ? (
              <div className="text-sm text-black/60">No categories.</div>
            ) : (
              categories.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                  <Checkbox
                    checked={selectedCategoryIds.has(c.id)}
                    onChange={(e) =>
                      setSelectedCategoryIds((prev) => toggleId(prev, c.id, e.target.checked))
                    }
                  />
                  <span>{c.name?.en ?? c.slug}</span>
                </label>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name…"
            />
            <div className="space-y-2 max-h-56 overflow-y-auto rounded border border-black/10 p-3">
              {filteredProducts.length === 0 ? (
                <div className="text-sm text-black/60">No matching products.</div>
              ) : (
                filteredProducts.map((p) => (
                  <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer py-0.5">
                    <Checkbox
                      checked={selectedProductIds.has(p.id)}
                      onChange={(e) =>
                        setSelectedProductIds((prev) => toggleId(prev, p.id, e.target.checked))
                      }
                    />
                    <span>{p.name?.en ?? p.slug}</span>
                  </label>
                ))
              )}
            </div>
          </div>
        )}

        <div>
          <div className="text-xs text-black/60 mb-2">Discount type</div>
          <div className="flex flex-wrap gap-4 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="offerDiscountKind"
                checked={discountKind === "percent"}
                onChange={() => setDiscountKind("percent")}
              />
              Percent off
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="offerDiscountKind"
                checked={discountKind === "fixed"}
                onChange={() => setDiscountKind("fixed")}
              />
              Fixed amount off
            </label>
          </div>
        </div>

        <div className="max-w-xs">
          <div className="text-xs text-black/60 mb-1">
            {discountKind === "percent" ? "Percent (1–100)" : "Amount off (decimal, e.g. 5.00)"}
          </div>
          <Input
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
            inputMode={discountKind === "percent" ? "numeric" : "decimal"}
          />
        </div>

        <Button
          disabled={!canSave}
          onClick={async () => {
            try {
              const pct =
                discountKind === "percent" ? Number.parseInt(discountValue, 10) || undefined : undefined;
              const fixedOff = discountKind === "fixed" ? parsePrice(discountValue) : undefined;
              await MarketingApi.offersCreate({
                name: name.trim(),
                targetType,
                targetIds: selectedTargetIds,
                ...(discountKind === "percent" ? { percentOff: pct } : { fixedOff }),
                isActive: true,
              } as OfferDto & Record<string, unknown>);
              Toast.success("Offer saved");
              setName("");
              setSelectedCollectionIds(new Set());
              setSelectedCategoryIds(new Set());
              setSelectedProductIds(new Set());
              setDiscountValue(discountKind === "percent" ? "15" : "5.00");
              await loadOffers();
            } catch (e) {
              Toast.error(getApiErrorMessage(e));
            }
          }}
        >
          Save offer
        </Button>
      </Card>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : (
          <DataTable
            data={offers}
            getRowId={(r) => rowId(r)}
            columns={[
              { key: "name", header: "Name" },
              { key: "targetType", header: "Target type" },
              {
                key: "targetIds",
                header: "Targets",
                render: (r) => `${(r.targetIds ?? []).length} selected`,
              },
              {
                key: "percentOff",
                header: "Discount",
                render: (r) =>
                  r.percentOff != null
                    ? `${r.percentOff}%`
                    : formatPrice((r as any).fixedOff ?? 0),
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
                      onLabel="On"
                      offLabel="Off"
                      aria-label={`Toggle offer ${r.name}`}
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.offersPatch(id, { isActive: next });
                          await loadOffers();
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
                  onClick={() => router.push(`/dashboard/marketing/offers/${rowId(r)}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Delete"
                  title="Delete"
                  onClick={async () => {
                    if (!confirm("Delete offer?")) return;
                    try {
                      await MarketingApi.offersDelete(rowId(r));
                      await loadOffers();
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
