/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { TextArea } from "@/components/ui/Textarea";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type HeroSlideDto } from "@/lib/api/marketing";
import { StorageService } from "@/lib/services/storage.service";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import MediaImage from "@/components/ui/MediaImage";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import type { LocalizedString } from "@/lib/api/catalog/types";

function localizedValue(value?: LocalizedString | string | null): LocalizedString {
  if (!value) return { ar: "", en: "" };
  if (typeof value === "string") return { ar: value, en: value };
  return { ar: value.ar ?? "", en: value.en ?? "" };
}

export default function EditHeroSlidePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [heroSlide, setHeroSlide] = useState<HeroSlideDto | null>(null);
  const [eyebrow, setEyebrow] = useState<LocalizedString>({ ar: "", en: "" });
  const [line1, setLine1] = useState<LocalizedString>({ ar: "", en: "" });
  const [line2, setLine2] = useState<LocalizedString>({ ar: "", en: "" });
  const [sub, setSub] = useState<LocalizedString>({ ar: "", en: "" });
  const [cta, setCta] = useState<LocalizedString>({ ar: "", en: "" });
  const [ctaHref, setCtaHref] = useState("");
  const [image, setImage] = useState("");
  const [published, setPublished] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.heroSlidesGetAdmin(id);
      const slide = res.heroSlide;
      setHeroSlide(slide);
      setEyebrow(localizedValue(slide.eyebrow));
      setLine1(localizedValue(slide.line1));
      setLine2(localizedValue(slide.line2));
      setSub(localizedValue(slide.sub));
      setCta(localizedValue(slide.cta));
      setCtaHref(slide.ctaHref || "");
      setImage(slide.image || "");
      setPublished(slide.published ?? false);
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const canSave = useMemo(
    () =>
      eyebrow.ar.trim().length > 0 &&
      eyebrow.en.trim().length > 0 &&
      line1.ar.trim().length > 0 &&
      line1.en.trim().length > 0 &&
      cta.ar.trim().length > 0 &&
      cta.en.trim().length > 0 &&
      image.trim().length > 0 &&
      ctaHref.trim().length > 0,
    [eyebrow, line1, cta, image, ctaHref]
  );

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!heroSlide) return <div className="text-sm text-black/60">Hero slide not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit Hero Slide</h1>
          <p className="text-sm text-black/60">Update content and image for this homepage hero slide.</p>
        </div>
        <Button
          variant="ghost"
          onClick={async () => {
            if (!confirm("Delete this hero slide?")) return;
            try {
              await MarketingApi.heroSlidesDelete(id);
              router.replace("/dashboard/marketing/hero");
            } catch (err) {
              Toast.error(getApiErrorMessage(err));
            }
          }}
        >
          Delete
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm">Eyebrow (AR)</div>
            <Input value={eyebrow.ar} onChange={(e) => setEyebrow((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Eyebrow (EN)</div>
            <Input value={eyebrow.en} onChange={(e) => setEyebrow((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Headline line 1 (AR)</div>
            <Input value={line1.ar} onChange={(e) => setLine1((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Headline line 1 (EN)</div>
            <Input value={line1.en} onChange={(e) => setLine1((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Headline line 2 (AR)</div>
            <Input value={line2.ar} onChange={(e) => setLine2((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Headline line 2 (EN)</div>
            <Input value={line2.en} onChange={(e) => setLine2((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Subtitle (AR)</div>
            <TextArea value={sub.ar} onChange={(e) => setSub((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">Subtitle (EN)</div>
            <TextArea value={sub.en} onChange={(e) => setSub((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">CTA text (AR)</div>
            <Input value={cta.ar} onChange={(e) => setCta((prev) => ({ ...prev, ar: e.target.value }))} />
          </div>
          <div className="space-y-1">
            <div className="text-sm">CTA text (EN)</div>
            <Input value={cta.en} onChange={(e) => setCta((prev) => ({ ...prev, en: e.target.value }))} />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">CTA link</div>
            <Input value={ctaHref} onChange={(e) => setCtaHref(e.target.value)} placeholder="/shop" />
          </div>
          <div className="space-y-1 md:col-span-2">
            <div className="text-sm">Status</div>
            <Toggle checked={published} onCheckedChange={setPublished} onLabel="Published" offLabel="Draft" />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <div className="text-sm">Hero image</div>
            {image ? (
              <div className="relative h-56 overflow-hidden rounded border border-black/10 bg-black/[0.02]">
                <MediaImage
                  src={resolveMediaUrl(image)}
                  alt={eyebrow.en || eyebrow.ar || "Hero image"}
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="flex h-56 items-center justify-center rounded border border-dashed border-black/10 bg-black/[0.02] text-sm text-black/50">
                No hero image set.
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
                    const upload = await StorageService.uploadImage("hero", file);
                    setImage(upload.url);
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

        <div className="flex gap-2 flex-wrap">
          <Button
            disabled={saving || !canSave}
            onClick={async () => {
              if (!canSave) return;
              setSaving(true);
              try {
                const res = await MarketingApi.heroSlidesPatch(id, {
                  eyebrow,
                  line1,
                  line2,
                  sub,
                  cta,
                  ctaHref: ctaHref.trim(),
                  image,
                  published,
                });
                setHeroSlide(res.heroSlide);
                Toast.saved();
              } catch (err) {
                Toast.error(getApiErrorMessage(err));
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
