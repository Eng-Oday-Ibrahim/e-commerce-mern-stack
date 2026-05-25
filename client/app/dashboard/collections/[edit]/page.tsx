/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { CollectionService } from "@/lib/services/catalog/collection.service";
import { ProductService } from "@/lib/services/catalog/product.service";
import type { ProductDto } from "@/lib/api/catalog/types";
import { StorageService } from "@/lib/services/storage.service";
import MediaImage from "@/components/ui/MediaImage";

export default function EditCollectionPage({ params }: { params: Promise<{ edit: string }> }) {
  const router = useRouter();
  const { edit: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productIds, setProductIds] = useState<string[]>([]);
  const [productQuery, setProductQuery] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await CollectionService.getAdminById(id);
        const c = res.collection;
        setNameAr(c.name.ar);
        setNameEn(c.name.en);
        setDescAr(c.description?.ar || "");
        setDescEn(c.description?.en || "");
        setIsActive(c.isActive);
        setSortOrder(c.sortOrder ?? 0);
        setProductIds(c.productIds ?? []);
        setImageUrl((c as any).imageUrl ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      setProductsLoading(true);
      try {
        const res = await ProductService.listAdmin();
        setProducts(res.products);
      } finally {
        setProductsLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Collection</h1>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
            <div className="ml-auto w-32">
              <div className="text-sm mb-1">Sort</div>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} />
            </div>
          </div>

          <div>
            <div className="text-sm mb-1">Name (AR)</div>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Name (EN)</div>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>

          <div>
            <div className="text-sm mb-1">Description (AR)</div>
            <TextArea value={descAr} onChange={(e) => setDescAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Description (EN)</div>
            <TextArea value={descEn} onChange={(e) => setDescEn(e.target.value)} />
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Image</div>
          <input
            type="file"
            accept="image/*"
            disabled={uploadingImage}
            onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              setUploadingImage(true);
              try {
                const res = await StorageService.uploadImage("collections", file);
                setImageUrl(res.url);
              } finally {
                setUploadingImage(false);
                e.target.value = "";
              }
            }}
          />
          {imageUrl ? (
            <div className="rounded border border-black/10 p-2 w-48 space-y-2">
              <div className="relative w-full h-28 rounded overflow-hidden">
                <MediaImage
                  src={imageUrl}
                  alt=""
                  fill
                  sizes="192px"
                  className="object-cover"
                />
              </div>
              <Button size="sm" variant="ghost" onClick={() => setImageUrl(null)}>
                Remove
              </Button>
            </div>
          ) : null}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Products</div>
          {productsLoading ? (
            <div className="text-sm text-black/60">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="text-sm text-black/60">No products yet.</div>
          ) : (
            <>
              <Input
                placeholder="Search products..."
                value={productQuery}
                onChange={(e) => setProductQuery(e.target.value)}
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {products
                  .filter((p) =>
                    (p.name.en || "")
                      .toLowerCase()
                      .includes(productQuery.trim().toLowerCase())
                  )
                  .map((p) => {
                const checked = productIds.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setProductIds((prev) =>
                          next ? [...prev, p.id] : prev.filter((x) => x !== p.id)
                        );
                      }}
                    />
                    <span className="truncate">{p.name.en}</span>
                  </label>
                );
                  })}
              </div>
            </>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await CollectionService.update(id, {
                  name: { ar: nameAr, en: nameEn },
                  description: { ar: descAr || "", en: descEn || "" },
                  productIds,
                  imageUrl,
                  isActive,
                  sortOrder,
                });
                router.replace("/dashboard/collections");
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
    </div>
  );
}
