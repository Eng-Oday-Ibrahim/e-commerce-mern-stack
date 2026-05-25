"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomerService } from "@/lib/services/identity/customer.service";

function CustomerResetPasswordInner() {
  const router = useRouter();
  const search = useSearchParams();

  const [token, setToken] = useState(search.get("token") || "");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Reset password</h1>
        <p className="text-sm text-black/60 mt-1">
          Enter the 6-digit reset code and your new password.
        </p>

        <div className="mt-6 space-y-3">
          <Input
            placeholder="Reset code"
            value={token}
            onChange={(e) => setToken(e.target.value)}
          />
          <Input
            placeholder="New password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                await CustomerService.ResetPassword({ token, newPassword });
                router.replace("/account");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Updating..." : "Update password"}
          </Button>
        </div>
      </Card>
    </div>
  );
}

export default function CustomerResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-black/60">Loading…</div>}>
      <CustomerResetPasswordInner />
    </Suspense>
  );
}
