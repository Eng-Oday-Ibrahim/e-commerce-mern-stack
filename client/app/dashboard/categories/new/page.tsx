/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Checkbox } from "@/components/ui/Checkbox";
import { CategoryService } from "@/lib/services/catalog/category.service";
import type { CategoryDto } from "@/lib/api/catalog/types";
import { StorageService } from "@/lib/services/storage.service";
import MediaImage from "@/components/ui/MediaImage";

export default function NewCategoryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
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
      setCatsLoading(true);
      try {
        const res = await CategoryService.listAdmin();
        setCategories(res.categories);
      } finally {
        setCatsLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Category</h1>
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
                {categories.map((c) => (
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
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await CategoryService.create({
                  name: { ar: nameAr, en: nameEn },
                  description: { ar: descAr || "", en: descEn || "" },
                  imageUrl: imageUrl || undefined,
                  parentCategoryId: parentCategoryId || undefined,
                  isActive,
                  sortOrder,
                });
                router.replace("/dashboard/categories");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
