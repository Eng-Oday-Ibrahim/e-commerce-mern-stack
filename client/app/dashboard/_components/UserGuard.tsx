"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserApi } from "@/api/identity/user";

export default function UserGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = useState(false);

  const isAuthPage = pathname?.startsWith("/dashboard/account/login")
    || pathname?.startsWith("/dashboard/account/forgot-password")
    || pathname?.startsWith("/dashboard/account/reset-password");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (isAuthPage) {
          if (!cancelled) setReady(true);
          return;
        }

        await UserApi.me();
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) {
          const next = encodeURIComponent(pathname || "/dashboard");
          router.replace(`/dashboard/account/login?next=${next}`);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [router, pathname, isAuthPage]);

  if (!ready) return null;
  return <>{children}</>;
}
