"use client";

import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomerService } from "@/lib/services/identity/customer.service";

export default function CustomerForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Forgot password</h1>
        <p className="text-sm text-black/60 mt-1">
          We will send you a 6-digit reset code.
        </p>

        <div className="mt-6 space-y-3">
          <Input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Button
            className="w-full"
            disabled={loading}
            onClick={async () => {
              setLoading(true);
              try {
                const res = await CustomerService.ForgotPassword({ email });
                const dev = (res as { dev?: { resetToken?: string } }).dev;
                setDevToken(dev?.resetToken ?? null);
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Sending..." : "Send reset"}
          </Button>

          {devToken ? (
            <div className="text-xs text-black/70 break-all">
              Dev code: <span className="font-mono">{devToken}</span>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
