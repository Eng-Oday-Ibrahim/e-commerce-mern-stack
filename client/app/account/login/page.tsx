/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomerService } from "@/lib/services/identity/customer.service";

function CustomerLoginInner() {
  const router = useRouter();
  const search = useSearchParams();
  const next = search.get("next") || "/account";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Login</h1>
        <p className="text-sm text-black/60 mt-1">Welcome back.</p>

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
                await CustomerService.login({ email, password });
                router.replace(next);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Signing in..." : "Sign in"}
          </Button>

          <div className="flex justify-between text-sm">
            <Link href="/account/forgot-password" className="underline underline-offset-4">
              Forgot password?
            </Link>
            <Link href="/account/register" className="underline underline-offset-4">
              Create account
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-black/60">Loading…</div>}>
      <CustomerLoginInner />
    </Suspense>
  );
}
