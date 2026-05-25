/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import DataTable from "@/components/ui/DataTable";
import { StockService } from "@/lib/services/stock.service";
import type { StockListItemDto } from "@/api/stock";
import Empty from "@/components/ui/Empty";

type StockRow = {
  id: string;
  productId: string;
  slug: string;
  isActive: boolean;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  action: string;
};

export default function DashboardStockPage() {
  const { m } = useI18n();
  const [items, setItems] = useState<StockListItemDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingProductId, setSavingProductId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [onHandByProductId, setOnHandByProductId] = useState<Record<string, number>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await StockService.listAll();
      setItems(res.items);
      const map: Record<string, number> = {};
      for (const it of res.items) map[it.product.id] = it.stock.onHandQty;
      setOnHandByProductId(map);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (it) =>
        it.product.slug.toLowerCase().includes(q) ||
        (it.product.name?.en || "").toLowerCase().includes(q)
    );
  }, [items, query]);

  const rows: StockRow[] = useMemo(
    () =>
      filtered.map((it) => ({
        id: it.product.id,
        productId: it.product.id,
        slug: it.product.slug,
        isActive: it.product.isActive,
        onHandQty: it.stock.onHandQty,
        reservedQty: it.stock.reservedQty,
        availableQty: it.stock.availableQty,
        action: it.product.id,
      })),
    [filtered]
  );

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Stock</h1>

      <Card className="p-4 space-y-3">
        <Input placeholder="Search by slug or name..." value={query} onChange={(e) => setQuery(e.target.value)} />
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : rows.length === 0 ? (
          <Empty
            variant="products"
            title={m.pages.stock.empty}
            description={m.pages.stock.emptyDescription}
          />
        ) : (
          <DataTable
            data={rows}
            getRowId={(row) => row.id}
            columns={[
              { key: "slug", header: "Slug" },
              {
                key: "onHandQty",
                header: "On Hand",
                render: (row) => (
                  <Input
                    type="number"
                    value={onHandByProductId[row.productId] ?? row.onHandQty}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setOnHandByProductId((prev) => ({
                        ...prev,
                        [row.productId]: Number(e.target.value),
                      }))
                    }
                  />
                ),
              },
              { key: "reservedQty", header: "Reserved" },
              { key: "availableQty", header: "Available" },
              {
                key: "action",
                header: "Action",
                render: (row) => (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={savingProductId === row.productId}
                    onClick={async (e) => {
                      e.stopPropagation();
                      setSavingProductId(row.productId);
                      try {
                        const next = onHandByProductId[row.productId] ?? row.onHandQty;
                        await StockService.setOnHand(row.productId, next);
                        await load();
                      } finally {
                        setSavingProductId(null);
                      }
                    }}
                  >
                    {savingProductId === row.productId ? "Saving..." : "Save"}
                  </Button>
                ),
              },
            ]}
          />
        )}
      </Card>
    </div>
  );
}
