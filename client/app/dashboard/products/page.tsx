"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import MediaImage from "@/components/ui/MediaImage";
import { ProductApi } from "@/lib/api/catalog/product";
import type { ProductDto } from "@/lib/api/catalog/types";
import { formatPrice } from "@/lib/utils/price";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";
import { Trash2, Edit2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardProductsPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [products, setProducts] = useState<ProductDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await ProductApi.listAdmin();
      setProducts(res.products);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(t);
  }, [load]);

  const toggleRow = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (products.length > 0 && selected.size === products.length) setSelected(new Set());
    else setSelected(new Set(products.map((p) => p.id)));
  };

  async function setActiveForMany(ids: string[], isActive: boolean) {
    try {
      for (const id of ids) {
        await ProductApi.update(id, { isActive });
      }
      Toast.success(isActive ? "Products activated" : "Products deactivated");
      setSelected(new Set());
      await load();
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    }
  }

  async function setActiveForOne(id: string, isActive: boolean) {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await ProductApi.update(id, { isActive });
      Toast.saved();
      await load();
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    } finally {
      setBusyIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Products</h1>
        <Link href="/dashboard/products/new">
          <Button>New Product</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : products.length === 0 ? (
          <Empty
            variant="products"
            title={m.pages.products.empty}
            description={m.pages.products.emptyDescription}
            actionLabel={m.pages.products.create}
            actionHref="/dashboard/products/new"
          />
        ) : (
          <DataTable
            data={products}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "images" as keyof ProductDto,
                header: "Image",
                render: (row: ProductDto) => {
                  const first = row.images?.[0] as string | undefined;
                  const src = first ? resolveMediaUrl(first) : undefined;
                  return src ? (
                    <MediaImage
                      src={src}
                      alt=""
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    "-"
                  );
                },
              },
              { key: "name" as keyof ProductDto, header: "Name", render: (row: ProductDto) => row.name.en },
              {
                key: "price" as keyof ProductDto,
                header: "Price",
                render: (row: ProductDto) => formatPrice(row.price),
              },
              {
                key: "isActive" as keyof ProductDto,
                header: "Active",
                render: (row: ProductDto) => (
                  <Toggle
                    checked={row.isActive}
                    disabled={busyIds.has(row.id)}
                    onLabel="Active"
                    offLabel="Inactive"
                    aria-label={`Toggle active for ${row.name.en}`}
                    onCheckedChange={(next) => {
                      void setActiveForOne(row.id, next);
                    }}
                  />
                ),
              },
            ]}
            selectionEnabled
            selectedRows={selected}
            onSelectRow={toggleRow}
            onSelectAll={toggleAll}
            bulkToolbar={
              <div className="flex flex-wrap items-center gap-3">
                <span>{selected.size} selected</span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={selected.size === 0}
                  onClick={() => void setActiveForMany(Array.from(selected), true)}
                >
                  Activate selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={selected.size === 0}
                  onClick={() => void setActiveForMany(Array.from(selected), false)}
                >
                  Deactivate selected
                </Button>
              </div>
            }
            renderActions={(row) => (
              <>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Edit"
                  title="Edit"
                  onClick={() => router.push(`/dashboard/products/${row.id}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  title="Remove"
                  onClick={async () => {
                    if (!confirm("Permanently delete this product? Fails if it appears in orders.")) return;
                    try {
                      await ProductApi.delete(row.id);
                      Toast.success("Deleted");
                      await load();
                    } catch (e) {
                      Toast.error(getApiErrorMessage(e));
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </>
            )}
          />
        )}
      </Card>
    </div>
  );
}
