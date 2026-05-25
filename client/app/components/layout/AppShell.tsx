"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { SkeletonTheme } from "react-loading-skeleton";
import Header from "./Header";
import Footer from "./Footer";
import AppToaster from "@/components/ui/Toaster";
import { I18nProvider } from "@/lib/i18n/I18nProvider";
import { CurrencyApi } from "@/api/currency";
import { setStoreCurrency } from "@/lib/utils/storeCurrency";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboard = pathname?.startsWith("/dashboard");

  useEffect(() => {
    (async () => {
      try {
        const res = await CurrencyApi.getPublicDefault();
        setStoreCurrency({
          code: res.currency.code,
          symbol: res.currency.symbol,
          decimals: res.currency.decimals,
        });
      } catch {
        // ignore
      }
    })();
  }, []);

  return (
    <I18nProvider forceLang={isDashboard ? "en" : undefined}>
      <SkeletonTheme baseColor="#e8e4dc" highlightColor="#f4f1ea" borderRadius="2px" duration={1.1}>
      <div className="min-h-full flex flex-col">
        {!isDashboard && <Header />}
        <main className="flex-1">{children}</main>
        {!isDashboard && <Footer />}
        <AppToaster />
      </div>
      </SkeletonTheme>
    </I18nProvider>
  );
}
