/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Toggle } from "@/components/ui/Toggle";
import DataTable from "@/components/ui/DataTable";
import { MarketingApi, type HeroSlideDto } from "@/lib/api/marketing";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2 } from "lucide-react";

function rowId(row: HeroSlideDto & { id?: string }) {
  return row.id ?? (row as any)._id ?? "";
}

export default function MarketingHeroPage() {
  const [heroSlides, setHeroSlides] = useState<HeroSlideDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await MarketingApi.heroSlidesListAdmin();
      setHeroSlides(res.heroSlides ?? []);
    } catch (error) {
      Toast.error(getApiErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const rows = useMemo(
    () =>
      heroSlides.map((slide) => ({
        ...slide,
        titleLabel: slide.eyebrow?.en || slide.eyebrow?.ar || "",
        descriptionLabel: slide.sub?.en || slide.sub?.ar || "",
        coverPreview: slide.image ? "Yes" : "Missing",
        published: slide.published ?? false,
      })),
    [heroSlides]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Hero slides</h1>
          <p className="text-sm text-black/60">
            Manage homepage hero slides: upload hero images, localized text and links.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/marketing/hero/new">
            <Button>New hero slide</Button>
          </Link>
        </div>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading hero slides…</div>
        ) : (
          <DataTable
            data={rows}
            getRowId={(row) => rowId(row)}
            columns={[
              { key: "titleLabel", header: "Title" },
              { key: "descriptionLabel", header: "Description" },
              {
                key: "coverPreview",
                header: "Cover image",
                render: (row) => (
                  <span className={row.image ? "text-emerald-600" : "text-amber-600"}>
                    {row.coverPreview}
                  </span>
                ),
              },
              {
                key: "published",
                header: "Published",
                render: (row) => {
                  const id = rowId(row);
                  return (
                    <Toggle
                      checked={row.published === true}
                      disabled={!id || busyIds.has(id)}
                      onLabel="Yes"
                      offLabel="No"
                      aria-label={`Toggle hero slide ${row.titleLabel}`}
                      onCheckedChange={async (next) => {
                        if (!id) return;
                        setBusyIds((prev) => new Set(prev).add(id));
                        try {
                          await MarketingApi.heroSlidesPatch(id, { published: next });
                          await load();
                        } catch (error) {
                          Toast.error(getApiErrorMessage(error));
                        } finally {
                          setBusyIds((prev) => {
                            const nextSet = new Set(prev);
                            nextSet.delete(id);
                            return nextSet;
                          });
                        }
                      }}
                    />
                  );
                },
              },
            ]}
            renderActions={(row) => (
              <Link href={`/dashboard/marketing/hero/${rowId(row)}`}>
                <Button size="xs" variant="ghost" title="Edit hero slide">
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              </Link>
            )}
            noDataMessage="No hero slides yet. Create a hero slide with image and content."
          />
        )}
      </Card>
    </div>
  );
}
