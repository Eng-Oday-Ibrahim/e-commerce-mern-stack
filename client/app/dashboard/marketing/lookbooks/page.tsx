/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import { MarketingApi, type LookbookDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";

function rowId(row: LookbookDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingLookbooksPage() {
  const router = useRouter();
  const [lookbooks, setLookbooks] = useState<LookbookDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.lookbooksListAdmin();
      setLookbooks(res.lookbooks ?? []);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      (lookbooks ?? []).map((l) => ({
        ...l,
        titleLabel: l.title?.en || l.title?.ar || "",
        published: l.published ?? false,
      })),
    [lookbooks]
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">Lookbooks</h1>
          <p className="text-sm text-black/60">Editorial stories with shoppable looks.</p>
        </div>
        <Link href="/dashboard/marketing/lookbooks/new">
          <Button>New lookbook</Button>
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
              { key: "titleLabel", header: "Title" },
              {
                key: "published",
                header: "Status",
                render: (r) => {
                  const id = rowId(r);
                  return (
                    <Toggle
                      checked={r.published === true}
                      disabled={!id || busyIds.has(id)}
                      onLabel="Published"
                      offLabel="Draft"
                      aria-label={`Toggle lookbook ${r.titleLabel}`}
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.lookbooksPatch(id, { published: next });
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
                  onClick={() => router.push(`/dashboard/marketing/lookbooks/${rowId(r)}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Delete"
                  title="Delete"
                  onClick={async () => {
                    if (!confirm("Delete lookbook? This also deletes its images/items.")) return;
                    try {
                      await MarketingApi.lookbooksDelete(rowId(r));
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
