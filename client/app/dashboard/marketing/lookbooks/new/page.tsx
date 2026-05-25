/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi } from "@/lib/api/marketing";
import { StorageService } from "@/lib/services/storage.service";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

export default function NewLookbookPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState<LocalizedString>({ ar: "", en: "" });
  const [description, setDescription] = useState<LocalizedString>({ ar: "", en: "" });
  const [coverImage, setCoverImage] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [published, setPublished] = useState(false);

  const canSave = useMemo(
    () => title.ar.trim().length > 0 && title.en.trim().length > 0,
    [title]
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">New Lookbook</h1>
      </div>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Title (AR)</div>
            <Input
              value={title.ar}
              onChange={(e) => {
                const v = e.target.value;
                setTitle((prev) => ({ ...prev, ar: v }));
              }}
              placeholder="عنوان اللوك بوك"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm">Title (EN)</div>
            <Input
              value={title.en}
              onChange={(e) => {
                const v = e.target.value;
                setTitle((prev) => ({ ...prev, en: v }));
              }}
              placeholder="e.g. Midnight Studio Edit"
            />
          </div>

          <div className="space-y-1">
            <div className="text-sm">Status</div>
            <Toggle checked={published} onCheckedChange={setPublished} onLabel="Published" offLabel="Draft" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Description (AR)</div>
            <TextArea
              value={description.ar}
              onChange={(e) => setDescription((prev) => ({ ...prev, ar: e.target.value }))}
              placeholder="وصف تحريري قصير..."
            />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Description (EN)</div>
            <TextArea
              value={description.en}
              onChange={(e) => setDescription((prev) => ({ ...prev, en: e.target.value }))}
              placeholder="A short editorial narrative for the lookbook…"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="text-sm">Cover image</div>
            {coverImage ? (
              <div className="relative h-40 overflow-hidden rounded border border-black/10 bg-black/[0.02]">
                <MediaImage
                  src={resolveMediaUrl(coverImage)}
                  alt={title.en || title.ar || "Cover image"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded border border-dashed border-black/10 bg-black/[0.02] text-sm text-black/50">
                No cover image set.
              </div>
            )}
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-sm hover:border-black/30 transition-colors">
              Upload image
              <input
                className="hidden"
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.currentTarget.files?.[0];
                  if (!file) return;
                  setUploadingImage(true);
                  try {
                    const upload = await StorageService.uploadImage("lookbooks", file);
                    setCoverImage(upload.url);
                  } catch (error) {
                    Toast.error(getApiErrorMessage(error));
                  } finally {
                    setUploadingImage(false);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </label>
            {uploadingImage ? <div className="text-sm text-black/60">Uploading image…</div> : null}
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving || !canSave}
            onClick={async () => {
              if (!canSave) return;
              setSaving(true);
              try {
                const res = await MarketingApi.lookbooksCreate({
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
                const id = res.lookbook.id;
                router.replace(`/dashboard/marketing/lookbooks/${id}`);
              } catch (err) {
                Toast.error(getApiErrorMessage(err));
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Creating..." : "Create"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
