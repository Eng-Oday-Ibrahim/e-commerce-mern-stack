/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Toggle } from "@/components/ui/Toggle";
import MediaImage from "@/components/ui/MediaImage";
import { CategoryApi } from "@/lib/api/catalog/category";
import type { CategoryDto } from "@/lib/api/catalog/types";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { Edit2, Trash2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardCategoriesPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await CategoryApi.listAdmin();
      setCategories(res.categories);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
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
    if (categories.length > 0 && selected.size === categories.length) setSelected(new Set());
    else setSelected(new Set(categories.map((c) => c.id)));
  };

  async function setActiveForMany(ids: string[], isActive: boolean) {
    try {
      for (const id of ids) {
        await CategoryApi.update(id, { isActive });
      }
      Toast.success(isActive ? "Categories activated" : "Categories deactivated");
      setSelected(new Set());
      await load();
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    }
  }

  async function setActiveForOne(id: string, isActive: boolean) {
    setBusyIds((prev) => new Set(prev).add(id));
    try {
      await CategoryApi.update(id, { isActive });
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

  async function deleteOne(id: string) {
    if (!confirm("Permanently delete this category?")) return;
    try {
      await CategoryApi.delete(id);
      Toast.success("Deleted");
      await load();
    } catch (e) {
      Toast.error(getApiErrorMessage(e));
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Categories</h1>
        <Link href="/dashboard/categories/new">
          <Button>New Category</Button>
        </Link>
      </div>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : categories.length === 0 ? (
          <Empty
            variant="products"
            title={m.pages.categories.empty}
            description={m.pages.categories.emptyDescription}
            actionLabel={m.pages.categories.create}
            actionHref="/dashboard/categories/new"
          />
        ) : (
          <DataTable
            data={categories}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "imageUrl",
                header: "Image",
                render: (row) =>
                  row.imageUrl ? (
                    <MediaImage
                      src={row.imageUrl}
                      alt=""
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 object-cover"
                    />
                  ) : (
                    "-"
                  ),
              },
              { key: "name", header: "Name", render: (row) => row.name.en },
              {
                key: "parentCategoryId",
                header: "Parent",
                render: (row) => (row.parentCategoryId ? "Yes" : "-"),
              },
              {
                key: "isActive",
                header: "Active",
                render: (row) => (
                  <Toggle
                    checked={row.isActive}
                    disabled={busyIds.has(row.id)}
                    onLabel="Active"
                    offLabel="Inactive"
                    aria-label={`Toggle active for ${row.name.en}`}
                    onCheckedChange={(next) => void setActiveForOne(row.id, next)}
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
                  onClick={() => router.push(`/dashboard/categories/${row.id}`)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="xs"
                  variant="ghost"
                  aria-label="Remove"
                  title="Remove"
                  onClick={() => void deleteOne(row.id)}
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
