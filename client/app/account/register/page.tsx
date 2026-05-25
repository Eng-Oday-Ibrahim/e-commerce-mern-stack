/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { CustomerService } from "@/lib/services/identity/customer.service";

export default function CustomerRegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="text-sm text-black/60 mt-1">Join Sudanista.</p>

        <div className="mt-6 space-y-3">
          <Input placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Input
            placeholder="Password (min 8 chars)"
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
                await CustomerService.register({ name, email, password });
                router.replace("/account");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Creating..." : "Create account"}
          </Button>

          <div className="text-sm">
            Already have an account?{" "}
            <Link href="/account/login" className="underline underline-offset-4">
              Login
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
