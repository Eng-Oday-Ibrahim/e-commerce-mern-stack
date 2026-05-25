/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useCallback, useEffect, useState } from "react";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReviewApi, type PendingReviewDto } from "@/lib/api/reviews";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Toast } from "@/lib/utils/toast";
import { Check, X, Trash2, Eye } from "lucide-react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";
export default function DashboardReviewsPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [reviews, setReviews] = useState<PendingReviewDto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ReviewApi.listPendingAdmin();
      setReviews(res.reviews);
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
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Reviews</h1>
      <p className="text-sm text-black/60">
        Pending reviews appear here. Accept to publish on the product page, or reject / remove.
      </p>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : reviews.length === 0 ? (
          <Empty
            variant="reviews"
            title={m.pages.reviews.empty}
            description={m.pages.reviews.emptyDescription}
          />
        ) : (
          <DataTable
            data={reviews}
            getRowId={(r) => r.id}
            columns={[
              {
                key: "productId",
                header: "Product",
                render: (r) => r.product?.name?.en ?? r.productId,
              },
              {
                key: "rating",
                header: "Stars",
                render: (r) => `${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}`,
              },
              {
                key: "description",
                header: "Review",
                render: (r) => (
                  <span className="line-clamp-3 whitespace-pre-wrap">{r.description}</span>
                ),
              },
              {
                key: "createdAt",
                header: "Submitted",
                render: (r) => (r.createdAt ? String(r.createdAt).slice(0, 10) : "—"),
              },
            ]}
            renderActions={(r) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="View"
                  title="View"
                  onClick={() => router.push(`/dashboard/reviews/${r.id}`)}
                >
                  <Eye className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  onClick={async () => {
                    try {
                      await ReviewApi.setStatusAdmin(r.id, "approved");
                      Toast.success("Published");
                      await load();
                    } catch (e) {
                      Toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  <Check className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="outline"
                  onClick={async () => {
                    try {
                      await ReviewApi.setStatusAdmin(r.id, "rejected");
                      await load();
                    } catch (e) {
                      Toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  onClick={async () => {
                    try {
                      await ReviewApi.deleteAdmin(r.id);
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
