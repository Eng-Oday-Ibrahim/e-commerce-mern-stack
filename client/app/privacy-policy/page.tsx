"use client";

import { useI18n } from "@/lib/i18n/I18nProvider";
import PolicyPageLayout from "@/components/layout/PolicyPageLayout";

export default function PrivacyPolicyPage() {
  const { m } = useI18n();

  const data = m.pages.policies.privacyPolicy;

  return <PolicyPageLayout data={data} />;
}