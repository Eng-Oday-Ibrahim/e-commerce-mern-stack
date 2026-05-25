/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type LookbookDto } from "@/lib/api/marketing";
import type { LocalizedString, ProductDto } from "@/lib/api/catalog/types";
import { ProductService } from "@/lib/services/catalog/product.service";
import { StorageService } from "@/lib/services/storage.service";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

function localizedValue(value?: LocalizedString | string | null): LocalizedString {
  if (!value) return { ar: "", en: "" };
  if (typeof value === "string") return { ar: value, en: value };
  return { ar: value.ar ?? "", en: value.en ?? "" };
}

export default function EditLookbookPage({ params }: { params: Promise<{ edit: string }> }) {
  const router = useRouter();
  const { edit: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productSearch, setProductSearch] = useState("");

  const [lookbook, setLookbook] = useState<LookbookDto | null>(null);
  const [linkedProductId, setLinkedProductId] = useState<string>("");

  const [title, setTitle] = useState<LocalizedString>({ ar: "", en: "" });
  const [description, setDescription] = useState<LocalizedString>({ ar: "", en: "" });
  const [coverImage, setCoverImage] = useState("");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [published, setPublished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const lb = await MarketingApi.lookbooksGetAdmin(id);
      const nextLookbook = lb.lookbook as LookbookDto;
      setLookbook(nextLookbook);
      setTitle(localizedValue(nextLookbook.title));
      setDescription(localizedValue(nextLookbook.description));
      setCoverImage(nextLookbook.coverImage ?? "");
      setPublished(nextLookbook.published ?? false);
      setLinkedProductId((nextLookbook as any).linkedProductId ?? "");
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, [id]);

  const loadProducts = useCallback(async () => {
    setProductsLoading(true);
    try {
      const res = await ProductService.listAdmin();
      setProducts(res.products ?? []);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const q = productSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => {
      const en = (p.name?.en ?? "").toLowerCase();
      const ar = (p.name?.ar ?? "").toLowerCase();
      return en.includes(q) || ar.includes(q) || (p.slug ?? "").toLowerCase().includes(q);
    });
  }, [products, productSearch]);

  const productById = useMemo(() => {
    const map = new Map<string, ProductDto>();
    for (const product of products) map.set(product.id, product);
    return map;
  }, [products]);

  const canSave = useMemo(
    () => title.ar.trim().length > 0 && title.en.trim().length > 0,
    [title]
  );

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!lookbook) return <div className="text-sm text-black/60">Not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold">Edit Lookbook</h1>
          <div className="text-sm text-black/60">{title.en || title.ar}</div>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            if (!confirm("Delete lookbook? This also deletes its images.")) return;
            try {
              await MarketingApi.lookbooksDelete(id);
              router.replace("/dashboard/marketing/lookbooks");
            } catch (e) {
              Toast.error(getApiErrorMessage(e));
            }
          }}
        >
          Delete
        </Button>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Title (AR)</div>
            <Input value={title.ar} onChange={(e) => setTitle((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Title (EN)</div>
            <Input value={title.en} onChange={(e) => setTitle((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Status</div>
            <Toggle checked={published} onCheckedChange={setPublished} onLabel="Published" offLabel="Draft" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Description (AR)</div>
            <TextArea value={description.ar} onChange={(e) => setDescription((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Description (EN)</div>
            <TextArea value={description.en} onChange={(e) => setDescription((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="text-sm">Cover image</div>
          {coverImage ? (
            <div className="relative h-48 overflow-hidden rounded border border-black/10 bg-black/[0.02]">
              <MediaImage
                src={resolveMediaUrl(coverImage)}
                alt={title.en || title.ar || "Cover image"}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div className="flex h-48 items-center justify-center rounded border border-dashed border-black/10 bg-black/[0.02] text-sm text-black/50">
              No cover image set.
            </div>
          )}
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-black/30 transition-colors">
            Upload cover image
            <input
              className="hidden"
              type="file"
              accept="image/*"
              onChange={async (e) => {
                const input = e.currentTarget;
                const file = input.files?.[0];
                if (!file) return;
                setUploadingCover(true);
                try {
                  const upload = await StorageService.uploadImage("lookbooks", file);
                  setCoverImage(upload.url);
                } catch (error) {
                  Toast.error(getApiErrorMessage(error));
                } finally {
                  setUploadingCover(false);
                  input.value = "";
                }
              }}
            />
          </label>
          {uploadingCover ? <div className="text-sm text-black/60">Uploading cover image…</div> : null}
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving || !canSave}
            onClick={async () => {
              if (!canSave) return;
              setSaving(true);
              try {
                const res = await MarketingApi.lookbooksPatch(id, {
                  title: {
                    ar: title.ar.trim(),
                    en: title.en.trim(),
                  },
                  description: {
                    ar: description.ar.trim(),
                    en: description.en.trim(),
                  },
                  coverImage: coverImage || undefined,
                  published,
                });
                setLookbook(res.lookbook);
                Toast.saved();
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </Card>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-lg font-semibold">Connected Product</div>
          <div className="text-sm text-black/60">Select one product to connect with this lookbook.</div>
        </div>

        {productsLoading ? (
          <div className="text-sm text-black/60">Loading products...</div>
        ) : (
          <div className="space-y-4">
            <Input
              value={productSearch}
              onChange={(e) => setProductSearch(e.target.value)}
              placeholder="Search products by name or slug..."
            />
            
            <div className="space-y-2">
              <label className="text-sm">Select Product</label>
              <select
                className="h-11 w-full rounded border border-black/10 px-3 text-sm"
                value={linkedProductId}
                onChange={(e) => setLinkedProductId(e.target.value)}
              >
                <option value="">No product selected</option>
                {filteredProducts.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name?.en ?? product.slug}
                  </option>
                ))}
              </select>
            </div>

            {linkedProductId && productById.get(linkedProductId) ? (
              <Card className="p-4 bg-blue-50 border-blue-100">
                <div className="space-y-3">
                  <div className="text-sm font-medium">Selected Product Preview</div>
                  <div className="flex gap-4">
                    <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded border border-black/10 bg-black/[0.03]">
                      <MediaImage
                        src={resolveMediaUrl(productById.get(linkedProductId)?.images?.[0])}
                        alt={productById.get(linkedProductId)?.name?.en ?? "Product"}
                        fill
                        sizes="128px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="font-medium">{productById.get(linkedProductId)?.name?.en ?? productById.get(linkedProductId)?.slug}</div>
                      <div className="text-sm text-black/60">{productById.get(linkedProductId)?.description?.en?.substring(0, 100)}</div>
                    </div>
                  </div>
                </div>
              </Card>
            ) : null}

            <div className="flex gap-2 pt-2">
              <Button
                disabled={saving || !canSave}
                onClick={async () => {
                  if (!canSave) return;
                  setSaving(true);
                  try {
                    const res = await MarketingApi.lookbooksPatch(id, {
                      title: {
                        ar: title.ar.trim(),
                        en: title.en.trim(),
                      },
                      description: {
                        ar: description.ar.trim(),
                        en: description.en.trim(),
                      },
                      coverImage: coverImage || undefined,
                      published,
                    linkedProductId: linkedProductId || null,
                    } as any);
                    setLookbook(res.lookbook);
                    Toast.saved();
                  } catch (e) {
                    Toast.error(getApiErrorMessage(e));
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? "Saving..." : "Save Product Connection"}
              </Button>
              <Button variant="ghost" onClick={() => router.back()}>
                Back
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
