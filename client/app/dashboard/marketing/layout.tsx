"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export default function MarketingLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const showBack = pathname !== "/dashboard/marketing";

  return (
    <div className="space-y-6">
      {showBack ? (
        <div className="text-sm">
          <Link
            href="/dashboard/marketing"
            className="inline-flex items-center gap-2 text-sm font-medium text-black/70 hover:text-black"
          >
            ← Back to marketing
          </Link>
        </div>
      ) : null}
      {children}
    </div>
  );
}
