/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { CustomerApi, type CustomerDto } from "@/api/identity/customer";
import { CustomerService } from "@/lib/services/identity/customer.service";
import { FadeInSection, PageEnter } from "@/components/motion/Motion";
import { useI18n } from "@/lib/i18n/I18nProvider";

export default function AccountPage() {
  const { m } = useI18n();
  const [loading, setLoading] = useState(true);
  const [customer, setCustomer] = useState<CustomerDto | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const me = await CustomerApi.me();

        setCustomer(me.customer);
      } catch {

        setCustomer(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageEnter>
    <div className="max-w-2xl mx-auto px-4 py-10">
      <FadeInSection>
      <h1 className="text-2xl font-semibold">{m.pages.account.title}</h1>

      <Card className="p-6 mt-6 space-y-3">
        {loading ? (
          <div className="text-sm text-black/60">Loading...</div>
        ) : customer ? (
          <>
            <div className="text-sm">{m.pages.account.name}</div>
            <div className="text-xs text-black/60">{customer?.name}</div>

            <div className="text-sm">{m.pages.account.email}</div>
            <div className="text-xs text-black/60">{customer?.email}</div>

            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                await CustomerService.logout();

                setCustomer(null);
              }}
            >
              {m.pages.account.logout}
            </Button>
          </>
        ) : (
          <>
            <div className="text-sm text-black/70">{m.pages.account.notLoggedIn}</div>
            <div className="flex gap-2">
              <Link href="/account/login">
                <Button size="sm">{m.pages.account.login}</Button>
              </Link>
              <Link href="/account/register">
                <Button size="sm" variant="outline">
                  {m.pages.account.register}
                </Button>
              </Link>
            </div>
          </>
        )}
      </Card>
      </FadeInSection>
    </div>
    </PageEnter>
  );
}
