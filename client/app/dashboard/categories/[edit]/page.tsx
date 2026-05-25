/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { CategoryService } from "@/lib/services/catalog/category.service";
import type { CategoryDto } from "@/lib/api/catalog/types";
import { StorageService } from "@/lib/services/storage.service";
import MediaImage from "@/components/ui/MediaImage";

export default function EditCategoryPage({ params }: { params: Promise<{ edit: string }> }) {
  const router = useRouter();
  const { edit: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [descAr, setDescAr] = useState("");
  const [descEn, setDescEn] = useState("");
  const [parentCategoryId, setParentCategoryId] = useState<string>("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await CategoryService.getAdminById(id);
        const c = res.category;
        setNameAr(c.name.ar);
        setNameEn(c.name.en);
        setDescAr(c.description?.ar || "");
        setDescEn(c.description?.en || "");
        setIsActive(c.isActive);
        setSortOrder(c.sortOrder ?? 0);
        setParentCategoryId(c.parentCategoryId ?? "");
        setImageUrl(c.imageUrl ?? null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      setCatsLoading(true);
      try {
        const res = await CategoryService.listAdmin();
        setCategories(res.categories);
      } finally {
        setCatsLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Edit Category</h1>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
            <div className="ml-auto w-32">
              <div className="text-sm mb-1">Sort</div>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
              />
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

          <div className="md:col-span-2">
            <div className="text-sm mb-1">Image</div>
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
              <div className="rounded border border-black/10 p-2 mt-2 w-48">
                <div className="relative w-full h-28 rounded overflow-hidden">
                  <MediaImage
                    src={imageUrl}
                    alt=""
                    fill
                    sizes="192px"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : null}
          </div>
          <div className="md:col-span-2">
            <div className="text-sm mb-1">Parent Category</div>
            {catsLoading ? (
              <div className="text-sm text-black/60">Loading categories...</div>
            ) : (
              <select
                className="h-11 w-full rounded border border-black/10 px-3 text-sm"
                value={parentCategoryId}
                onChange={(e) => setParentCategoryId(e.target.value)}
              >
                <option value="">Up-level (no parent)</option>
                {categories
                  .filter((c) => c.id !== id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name.en}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await CategoryService.update(id, {
                  name: { ar: nameAr, en: nameEn },
                  description: { ar: descAr || "", en: descEn || "" },
                  imageUrl,
                  parentCategoryId: parentCategoryId ? parentCategoryId : null,
                  isActive,
                  sortOrder,
                });
                router.replace("/dashboard/categories");
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
