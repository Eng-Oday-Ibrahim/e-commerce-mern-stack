/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type CampaignDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";

function rowId(row: CampaignDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingCampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<CampaignDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.campaignsList();
      setCampaigns(res.campaigns as CampaignDto[]);
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
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Campaigns</h1>
          <p className="text-sm text-black/60">Group coupons and offers for reporting.</p>
        </div>
        <Link href="/dashboard/marketing/campaigns/new">
          <Button>New campaign</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : (
          <DataTable
            data={campaigns}
            getRowId={(r) => rowId(r)}
            columns={[
              { key: "name", header: "Name" },
              { key: "slug", header: "Slug" },
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
                      aria-label={`Toggle campaign ${r.name}`}
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.campaignsPatch(id, { isActive: next });
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
            renderActions={(r) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  type="button"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => router.push(`/dashboard/marketing/campaigns/${rowId(r)}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Delete"
                  title="Delete"
                  onClick={async () => {
                    if (!confirm("Delete campaign?")) return;
                    try {
                      await MarketingApi.campaignsDelete(rowId(r));
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
