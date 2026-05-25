/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type AnnouncementDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";

function rowId(row: AnnouncementDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingAnnouncementBarPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.announcementsList();
      setRows(res.announcements as AnnouncementDto[]);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Announcement bar</h1>
          <p className="text-sm text-black/60">Messages shown to shoppers when active.</p>
        </div>
        <Link href="/dashboard/marketing/Announcement-bar/new">
          <Button>New</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : (
          <DataTable
            data={rows}
            getRowId={(r) => rowId(r)}
            columns={[
              {
                key: "message",
                header: "Message",
                render: (r) => (
                  <div className="space-y-1">
                    <div className="line-clamp-2">EN: {r.message?.en || "-"}</div>
                    <div className="line-clamp-2">AR: {r.message?.ar || "-"}</div>
                  </div>
                ),
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
                      onLabel="Active"
                      offLabel="Inactive"
                      aria-label="Toggle announcement"
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.announcementsPatch(id, { isActive: next });
                          await load();
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
            onRowClick={(r) => {
              const id = rowId(r);
              if (!id) return;
              router.push(`/dashboard/marketing/Announcement-bar/${id}`);
            }}
            renderActions={(r) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => {
                    const id = rowId(r);
                    if (!id) return;
                    router.push(`/dashboard/marketing/Announcement-bar/${id}`);
                  }}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  title="Remove"
                  onClick={async () => {
                    const id = rowId(r);
                    if (!id) return;
                    if (!confirm("Delete announcement?")) return;
                    try {
                      await MarketingApi.announcementsDelete(id);
                      await load();
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
