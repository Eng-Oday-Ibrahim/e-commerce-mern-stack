"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { Button } from "@/components/ui/Button";
import { CurrencyService } from "@/lib/services/currency.service";

export default function NewCurrencyPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [decimals, setDecimals] = useState(2);
  const [isDefault, setIsDefault] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">New Currency</h1>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Code</div>
            <Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="USD" />
          </div>
          <div>
            <div className="text-sm mb-1">Name</div>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="US Dollar" />
          </div>
          <div>
            <div className="text-sm mb-1">Symbol</div>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} placeholder="$" />
          </div>
          <div>
            <div className="text-sm mb-1">Decimals</div>
            <Input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(Number(e.target.value))}
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isDefault} onChange={(e) => setIsDefault(e.target.checked)} />
            <div className="text-sm">Default</div>
          </div>

          <div className="flex items-center gap-2">
            <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
            <div className="text-sm">Active</div>
          </div>

          <div>
            <div className="text-sm mb-1">Sort Order</div>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await CurrencyService.create({
                  code,
                  name,
                  symbol: symbol || undefined,
                  decimals,
                  isDefault,
                  isActive,
                  sortOrder,
                });
                router.replace("/dashboard/currencies");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </Card>
    </div>
  );
}
