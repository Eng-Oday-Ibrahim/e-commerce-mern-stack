"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DataTable from "@/components/ui/DataTable";
import { Card } from "@/components/ui/Card";
import { CustomerApi, type CustomerDto } from "@/lib/api/identity/customer";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useI18n } from "@/lib/i18n/I18nProvider";
import Empty from "@/components/ui/Empty";

export default function DashboardCustomersPage() {
  const { m } = useI18n();
  const router = useRouter();
  const [customers, setCustomers] = useState<CustomerDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await CustomerApi.listAdmin();
        setCustomers(res.customers);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Customers</h1>

      <Card className="p-4">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : customers.length === 0 ? (
          <Empty
            variant="customers"
            title={m.pages.customers.empty}
            description={m.pages.customers.emptyDescription}
          />
        ) : (
          <DataTable
            data={customers}
            getRowId={(row) => row.id}
            columns={[
              {
                key: "email",
                header: "Email/Phone",
                render: (row: CustomerDto) => {
                  const email = row.email;
                  const phone = row.phone;
                  if (typeof email === 'string' && email.startsWith('guest+')) {
                    return phone ?? email;
                  }
                  return email ?? '-';
                },
              },
              { key: "name", header: "Name" },
              {
                key: "createdAt",
                header: "Joined",
                render: (row) => (row.createdAt ? String(row.createdAt).slice(0, 10) : "—"),
              },
            ]}
            renderActions={(row) => (
              <Button
                type="button"
                size="xs"
                variant="ghost"
                aria-label="View"
                title="View"
                onClick={() => router.push(`/dashboard/customers/${row.id}`)}
              >
                <Eye className="h-3.5 w-3.5" />
              </Button>
            )}
          />
        )}
      </Card>
    </div>
  );
}
