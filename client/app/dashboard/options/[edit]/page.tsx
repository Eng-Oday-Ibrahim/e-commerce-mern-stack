/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Checkbox } from "@/components/ui/Checkbox";
import { OptionService } from "@/lib/services/catalog/option.service";

type OptionValueRow = {
  value: string;
  hex: string;
};

export default function EditOptionPage({ params }: { params: Promise<{ edit: string }> }) {
  const router = useRouter();
  const { edit: id } = use(params);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [slug, setSlug] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [type, setType] = useState<"text" | "color">("text");
  const [values, setValues] = useState<OptionValueRow[]>([]);
  const [isActive, setIsActive] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await OptionService.getAdminById(id);
        const o = res.option;
        setSlug(o.slug);
        setNameAr(o.name.ar);
        setNameEn(o.name.en);
        setType((o.type as any) || "text");
        setValues(
          (o.values ?? []).map((v: any) => ({
            value: v.value ?? v.key,
            hex: v.hex ?? v.value ?? "#000000",
          }))
        );
        setIsActive(o.isActive);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <div className="text-sm text-black/60">Loading...</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Edit Option</h1>

      <Card className="p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="text-sm mb-1">Slug</div>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </div>

          <div className="flex items-end gap-2">
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
              Active
            </label>
          </div>

          <div>
            <div className="text-sm mb-1">Name (AR)</div>
            <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} />
          </div>
          <div>
            <div className="text-sm mb-1">Name (EN)</div>
            <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} />
          </div>

          <div>
            <div className="text-sm mb-1">Value Type</div>
            <select
              className="h-11 w-full rounded border border-black/10 px-3 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            >
              <option value="text">Text</option>
              <option value="color">Color</option>
            </select>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium">Values</div>
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setValues((prev) => [
                  ...prev,
                  { value: "", hex: "#000000" },
                ])
              }
            >
              Add Value
            </Button>
          </div>

          {values.length === 0 ? (
            <div className="text-sm text-black/60">No values yet.</div>
          ) : (
            <div className="space-y-3">
              {values.map((v, idx) => (
                <div key={idx} className="rounded border border-black/10 p-4 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="flex items-end justify-end md:col-span-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setValues((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </Button>
                    </div>

                    {type === "color" ? (
                      <>
                        <div>
                          <div className="text-xs text-black/60 mb-1">Color</div>
                          <input
                            type="color"
                            className="h-11 w-full rounded border border-black/10 px-3"
                            value={v.hex || "#000000"}
                            onChange={(e) =>
                              setValues((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, hex: e.target.value } : x))
                              )
                            }
                          />
                        </div>
                        <div>
                          <div className="text-xs text-black/60 mb-1">Hex</div>
                          <Input
                            value={v.hex}
                            onChange={(e) =>
                              setValues((prev) =>
                                prev.map((x, i) => (i === idx ? { ...x, hex: e.target.value } : x))
                              )
                            }
                          />
                        </div>
                      </>
                    ) : (
                      <div className="md:col-span-2">
                        <div className="text-xs text-black/60 mb-1">Value</div>
                        <Input
                          value={v.value}
                          onChange={(e) =>
                            setValues((prev) =>
                              prev.map((x, i) => (i === idx ? { ...x, value: e.target.value } : x))
                            )
                          }
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              try {
                await OptionService.update(id, {
                  slug,
                  name: { ar: nameAr, en: nameEn },
                  type,
                  values: values.map((v) => ({
                    value: type === "color" ? v.hex : v.value,
                    hex: type === "color" ? v.hex : undefined,
                  })),
                  isActive,
                });
                router.replace("/dashboard/options");
              } finally {
                setSaving(false);
              }
            }}
          >
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button variant="ghost" onClick={() => router.back()}>
            Back
          </Button>
        </div>
      </Card>
    </div>
  );
}
