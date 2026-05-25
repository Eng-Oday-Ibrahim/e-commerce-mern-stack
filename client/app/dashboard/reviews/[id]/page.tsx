/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ReviewApi, type PendingReviewDto } from "@/lib/api/reviews";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Check, Trash2, X } from "lucide-react";

export default function DashboardReviewDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<PendingReviewDto | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ReviewApi.getAdminById(id);
      setReview(res.review);
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
      setReview(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;
  if (!review) return <div className="text-sm text-black/60">Review not found.</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-xl font-semibold">Review</h1>
          <div className="text-sm text-black/60">{review.id}</div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={async () => {
              try {
                await ReviewApi.setStatusAdmin(review.id, "approved");
                Toast.success("Published");
                router.replace("/dashboard/reviews");
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              }
            }}
          >
            <Check className="h-4 w-4 mr-2" />
            Approve
          </Button>
          <Button
            variant="outline"
            onClick={async () => {
              try {
                await ReviewApi.setStatusAdmin(review.id, "rejected");
                Toast.saved();
                router.replace("/dashboard/reviews");
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              }
            }}
          >
            <X className="h-4 w-4 mr-2" />
            Reject
          </Button>
          <Button
            variant="ghost"
            onClick={async () => {
              if (!confirm("Delete this review?")) return;
              try {
                await ReviewApi.deleteAdmin(review.id);
                Toast.success("Deleted");
                router.replace("/dashboard/reviews");
              } catch (e) {
                Toast.error(getApiErrorMessage(e));
              }
            }}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <Card className="p-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm text-black/60">Product</div>
            <div className="font-medium">
              {review.product?.name?.en ?? review.productId}
              {review.product?.id ? (
                <span className="ml-2 text-sm">
                  <Link className="underline" href={`/dashboard/products/${review.product.id}`}>
                    View product
                  </Link>
                </span>
              ) : null}
            </div>
          </div>
          <div>
            <div className="text-sm text-black/60">Submitted</div>
            <div className="font-medium">
              {review.createdAt ? String(review.createdAt).slice(0, 19) : "—"}
            </div>
          </div>
          <div>
            <div className="text-sm text-black/60">Customer</div>
            <div className="font-medium">{review.customer?.email ?? review.customerId ?? "—"}</div>
            {review.customer?.name ? <div className="text-sm text-black/60">{review.customer.name}</div> : null}
          </div>
          <div>
            <div className="text-sm text-black/60">Stars</div>
            <div className="font-medium">
              {`${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}`}
            </div>
          </div>
        </div>

        <div>
          <div className="text-sm text-black/60 mb-1">Review</div>
          <div className="whitespace-pre-wrap">{review.description}</div>
        </div>
      </Card>
    </div>
  );
}

