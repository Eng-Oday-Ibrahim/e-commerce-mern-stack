/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { MarketingApi } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [messageEn, setMessageEn] = useState("");
  const [messageAr, setMessageAr] = useState("");
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New announcement</h1>

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
            disabled={saving || (!messageEn.trim() && !messageAr.trim())}
            onClick={async () => {
              setSaving(true);
              try {
                await MarketingApi.announcementsCreate({
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

