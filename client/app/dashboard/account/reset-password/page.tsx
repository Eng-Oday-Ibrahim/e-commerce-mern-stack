"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { UserService } from "@/lib/services/identity/user.service";

export default function DashboardResetPasswordPage() {
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
          Enter the reset token and your new password.
        </p>

        <div className="mt-6 space-y-3">
          <Input placeholder="Reset token" value={token} onChange={(e) => setToken(e.target.value)} />
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
                await UserService.ResetPassword({ token, newPassword });
                router.replace("/dashboard");
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
