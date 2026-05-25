"use client";

import Skeleton from "react-loading-skeleton";

/** Product grid on /shop — matches `ProductCard` grid density. */
export function ShopProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-4">
      <Skeleton height={14} width={180} />
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="border border-black/10 bg-white overflow-hidden flex flex-col">
            <Skeleton height={280} className="!leading-none" borderRadius={0} />
            <div className="p-4 space-y-2 flex-1">
              <Skeleton height={18} width="75%" />
              <Skeleton height={14} width="40%" />
              <div className="pt-2 flex gap-2">
                <Skeleton height={36} width={100} />
                <Skeleton height={36} width={100} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** /shop/[slug] initial layout — mirrors gallery + buy column. */
export function ProductDetailPageSkeleton() {
  return (
    <div className="min-h-screen container mx-auto px-4">
      <div className="px-6 md:px-12 pt-6 pb-2">
        <Skeleton height={12} width={160} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] xl:grid-cols-[1fr_460px] min-h-[70vh]">
        <div className="min-h-[50vh] lg:min-h-[80vh] bg-neutral-50">
          <Skeleton height="70vh" borderRadius={0} />
        </div>
        <div className="px-6 md:px-10 py-10 space-y-5">
          <Skeleton height={28} count={2} className="my-1" />
          <Skeleton height={22} width={120} />
          <Skeleton height={40} width="100%" />
          <Skeleton height={40} width="100%" />
          <Skeleton height={48} width="100%" />
          <Skeleton height={14} count={4} className="my-0.5" />
        </div>
      </div>
    </div>
  );
}

export function CategoryCardsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded border border-black/10 p-4 bg-white">
          <Skeleton height={144} className="mb-3" />
          <Skeleton height={20} width="55%" />
          <Skeleton height={14} count={2} className="mt-2" />
        </div>
      ))}
    </div>
  );
}

export function CollectionCardsSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded border border-black/10 overflow-hidden bg-white">
          <Skeleton height={176} borderRadius={0} />
          <div className="p-4 space-y-2">
            <Skeleton height={20} width="50%" />
            <Skeleton height={14} count={2} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function CartLineTitleSkeleton() {
  return <Skeleton height={20} width="65%" />;
}

export function CheckoutTotalsSkeleton() {
  return (
    <div className="mb-4 rounded border border-black/10 p-3 text-sm space-y-3">
      <Skeleton height={18} />
      <Skeleton height={18} />
      <Skeleton height={18} />
      <div className="pt-2 border-t border-black/10">
        <Skeleton height={22} />
      </div>
    </div>
  );
}
