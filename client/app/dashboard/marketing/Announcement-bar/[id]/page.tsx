/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { MarketingApi, type AnnouncementDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

function rowId(row: AnnouncementDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function EditAnnouncementPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [row, setRow] = useState<AnnouncementDto | null>(null);

  const [messageEn, setMessageEn] = useState("");
  const [messageAr, setMessageAr] = useState("");
  const [isActive, setIsActive] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.announcementsList();
      const found = (res.announcements as AnnouncementDto[]).find((a) => rowId(a) === id) ?? null;
      setRow(found);
      setMessageEn(found?.message?.en ?? "");
      setMessageAr(found?.message?.ar ?? "");
      setIsActive(found?.isActive !== false);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
      setRow(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!row) return <div className="text-sm text-black/60">Announcement not found.</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit announcement</h1>

      <Card className="p-6 space-y-4">
        <div>
          <div className="text-sm mb-1">Message (EN)</div>
          <Input value={messageEn} onChange={(e) => setMessageEn(e.target.value)} />
        </div>
        <div>
          <div className="text-sm mb-1">Message (AR)</div>
          <Input value={messageAr} onChange={(e) => setMessageAr(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
          Active
        </label>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await MarketingApi.announcementsPatch(id, {
                  message: { en: messageEn.trim(), ar: messageAr.trim() },
                  isActive,
                });
                Toast.success("Saved");
                router.replace("/dashboard/marketing/Announcement-bar");
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
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}

