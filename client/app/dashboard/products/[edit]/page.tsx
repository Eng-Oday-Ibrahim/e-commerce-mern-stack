/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { ProductService } from "@/lib/services/catalog/product.service";
import { CategoryService } from "@/lib/services/catalog/category.service";
import { OptionService } from "@/lib/services/catalog/option.service";
import type { CategoryDto, OptionDto } from "@/lib/api/catalog/types";
import { StorageService } from "@/lib/services/storage.service";
import { parsePrice } from "@/lib/utils/price";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";

export default function EditProductPage({ params }: { params: Promise<{ edit: string }> }) {
  const router = useRouter();
  const { edit: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [options, setOptions] = useState<OptionDto[]>([]);
  const [refsLoading, setRefsLoading] = useState(true);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [price, setPrice] = useState("0.00");
  const [isActive, setIsActive] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  const [categoryIds, setCategoryIds] = useState<string[]>([]);
  const [hasOptions, setHasOptions] = useState(false);
  const [optionSelections, setOptionSelections] = useState<Record<string, string[]>>({});
  const [images, setImages] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await ProductService.getAdminById(id);
        const p = res.product;
        setNameAr(p.name.ar);
        setNameEn(p.name.en);
        setDescAr(p.description?.ar || "");
        setDescEn(p.description?.en || "");
        setPrice((p.price ?? 0).toFixed(2));
        setIsActive(p.isActive);
        setIsFeatured((p as any).isFeatured ?? false);
        setCategoryIds(p.categoryIds ?? []);
        setImages((p.images ?? []) as any);

        const selections: Record<string, string[]> = {};
        const productOptions = (p as any).options as Array<{ optionId: string; valueKeys: string[] }> | undefined;
        if (productOptions?.length) {
          for (const s of productOptions) selections[s.optionId] = s.valueKeys ?? [];
          setHasOptions(true);
          setOptionSelections(selections);
        } else if ((p.optionIds ?? []).length) {
          for (const oid of p.optionIds) selections[oid] = [];
          setHasOptions(true);
          setOptionSelections(selections);
        } else {
          setHasOptions(false);
          setOptionSelections({});
        }

      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      setRefsLoading(true);
      try {
        const [cats, opts] = await Promise.all([
          CategoryService.listAdmin(),
          OptionService.listAdmin(),
        ]);
        setCategories(cats.categories);
        setOptions(opts.options);
      } finally {
        setRefsLoading(false);
      }
    })();
  }, []);

  const optionsPayload = useMemo(
    () =>
      Object.entries(optionSelections).map(([optionId, valueKeys]) => ({
        optionId,
        valueKeys,
      })),
    [optionSelections]
  );

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Product</h1>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div>
            <div className="text-sm mb-1">Price</div>
            <Input
              inputMode="decimal"
              placeholder="00.00"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <div className="text-sm">Active</div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
            <div className="text-sm">Featured</div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Images</div>
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={uploadingImages}
            onChange={async (e) => {
              const files = Array.from(e.target.files ?? []);
              if (files.length === 0) return;
              setUploadingImages(true);
              try {
                for (const file of files) {
                  const res = await StorageService.uploadImage("products", file);
                  setImages((prev) => [...prev, res.url]);
                }
              } finally {
                setUploadingImages(false);
                e.target.value = "";
              }
            }}
          />

          {images.length === 0 ? (
            <div className="text-sm text-black/60">No images yet.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {images.map((src) => (
                <div key={src} className="rounded border border-black/10 p-2 space-y-2">
                  <div className="relative w-full h-28 rounded overflow-hidden">
                    <MediaImage
                      src={resolveMediaUrl(src)}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 400px"
                      className="object-cover"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setImages((prev) => prev.filter((x) => x !== src))}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="text-sm font-medium">Categories</div>
          {refsLoading ? (
            <div className="text-sm text-black/60">Loading...</div>
          ) : categories.length === 0 ? (
            <div className="text-sm text-black/60">No categories yet.</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {categories.map((c) => {
                const checked = categoryIds.includes(c.id);
                return (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onChange={(e) => {
                        const next = e.target.checked;
                        setCategoryIds((prev) =>
                          next ? [...prev, c.id] : prev.filter((x) => x !== c.id)
                        );
                      }}
                    />
                    <span className="truncate">{c.name.en}</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium">
            <Checkbox checked={hasOptions} onChange={(e) => setHasOptions(e.target.checked)} />
            This product has options
          </label>

          {!hasOptions ? null : refsLoading ? (
            <div className="text-sm text-black/60">Loading options...</div>
          ) : options.length === 0 ? (
            <div className="text-sm text-black/60">No options yet.</div>
          ) : (
            <div className="space-y-3">
              {options.map((o) => {
                const selected = Object.prototype.hasOwnProperty.call(optionSelections, o.id);
                const selectedKeys = optionSelections[o.id] ?? [];
                return (
                  <div key={o.id} className="rounded border border-black/10 p-4 space-y-2">
                    <label className="flex items-center gap-2 text-sm font-medium">
                      <Checkbox
                        checked={selected}
                        onChange={(e) => {
                          const next = e.target.checked;
                          setOptionSelections((prev) => {
                            const copy = { ...prev };
                            if (next) copy[o.id] = copy[o.id] ?? [];
                            else delete copy[o.id];
                            return copy;
                          });
                        }}
                      />
                      {o.name.en}
                    </label>

                    {!selected ? null : o.values?.length ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pl-6">
                        {o.values.map((v) => {
                          const checked = selectedKeys.includes(v.key);
                          return (
                            <label key={v.key} className="flex items-center gap-2 text-sm">
                              <Checkbox
                                checked={checked}
                                onChange={(e) => {
                                  const next = e.target.checked;
                                  setOptionSelections((prev) => {
                                    const copy = { ...prev };
                                    const keys = new Set(copy[o.id] ?? []);
                                    if (next) keys.add(v.key);
                                    else keys.delete(v.key);
                                    copy[o.id] = Array.from(keys);
                                    return copy;
                                  });
                                }}
                              />
                              {o.type === "color" ? (
                                <span
                                  className="inline-block h-4 w-4 rounded border border-black/10"
                                  style={{ backgroundColor: v.hex ?? v.value ?? "#000000" }}
                                />
                              ) : null}
                              <span className="truncate">{v.value ?? v.hex ?? v.key}</span>
                            </label>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="text-sm text-black/60 pl-6">No values for this option.</div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await ProductService.update(id, {
                  name: { ar: nameAr, en: nameEn },
                  description: { ar: descAr || "", en: descEn || "" },
                  price: parsePrice(price),
                  categoryIds,
                  options: hasOptions ? optionsPayload : [],
                  images,
                  isActive,
                  isFeatured,
                });
                router.replace("/dashboard/products");
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

      <Card className="p-6 space-y-2">
        <div className="text-sm text-black/70">Stock is managed from the Stock page.</div>
        <Button size="sm" variant="outline" onClick={() => router.push("/dashboard/stock")}>
          Go to Stock
        </Button>
      </Card>
    </div>
  );
}
