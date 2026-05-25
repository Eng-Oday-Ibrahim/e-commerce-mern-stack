"use client";

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Lang, getStoredLang, langDir, setStoredLang } from "./lang";
import { messagesByLang, type Messages } from "./messages";

type I18nContextValue = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  m: Messages;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  children,
  forceLang,
}: {
  children: React.ReactNode;
  forceLang?: Lang;
}) {
  const [stored, setStored] = useState<Lang>(() => getStoredLang());
  const lang = forceLang ?? stored;

  const setLang = useCallback((next: Lang) => {
    if (forceLang) return;
    setStored(next);
    setStoredLang(next);
  }, [forceLang]);

  useEffect(() => {
    // Keep document direction + language in sync for styling (RTL/LTR, fonts).
    document.documentElement.lang = lang;
    document.documentElement.dir = langDir(lang);
  }, [lang]);

  const value = useMemo<I18nContextValue>(
    () => ({ lang, setLang, m: messagesByLang[lang] }),
    [lang, setLang]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // This should only happen if a component is used outside AppShell.
    return { lang: "en", setLang: () => {}, m: messagesByLang.en };
  }
  return ctx;
}
