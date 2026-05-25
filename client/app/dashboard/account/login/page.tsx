"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserService } from "@/lib/services/identity/user.service";

export default function DashboardLoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">User Login</h1>
        <p className="text-sm text-black/60 mt-1">
          Sign in to access the dashboard.
        </p>

        <div className="mt-6 space-y-3">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await UserService.login({ email, password });
                router.replace(next);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="text-sm">
            <Link href="/dashboard/account/forgot-password" className="underline underline-offset-4">
              Forgot password?
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
