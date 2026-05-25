"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserApi, type UserDto } from "@/api/identity/user";
import { UserService } from "@/lib/services/identity/user.service";

type Me = { userId: string; user: UserDto };

export default function DashboardAccountPage() {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Me | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await UserApi.me();
        setMe(res);
      } catch {
        setMe(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold">Account</h1>

      <Card className="p-6 mt-6 space-y-3">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : me ? (
          <>
            <div className="text-sm">Name</div>
            <div className="text-xs text-black/60">{me.user?.name}</div>

            <div className="text-sm">Email</div>
            <div className="text-xs text-black/60">{me.user?.email}</div>

            {/* roles removed on server; no role info shown */}

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await UserService.logout();
                setMe(null);
              }}
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-black/70">You are not logged in.</div>
            <Link href="/dashboard/account/login" className="underline underline-offset-4 text-sm">
              Go to login
            </Link>
          </>
        )}
      </Card>
    </div>
  );
}
