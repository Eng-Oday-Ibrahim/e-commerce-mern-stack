"use client";

import { useEffect, useMemo, useState } from "react";
import { MarketingApi } from "@/lib/api/marketing";
import { useI18n } from "@/lib/i18n/I18nProvider";
import { motion, AnimatePresence } from "framer-motion";

export const AnnouncementBar: React.FC = () => {
  const { lang } = useI18n();
  const [messages, setMessages] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const res = await MarketingApi.announcementsActive();
        const nextMessages = (res.announcements ?? [])
          .map((a) => {
            const raw: any = a.message as any;
            if (typeof raw === "string") return raw.trim();
            return (lang === "ar" ? raw?.ar : raw?.en)?.trim();
          })
          .filter((m): m is string => !!m);
        setMessages(nextMessages);
      } catch {
        setMessages([]);
      }
    })();
  }, [lang]);

  useEffect(() => {
    if (messages.length <= 1) return;
    const interval = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % messages.length);
    }, 3500);
    return () => window.clearInterval(interval);
  }, [messages]);

  const current = useMemo(() => {
    if (!messages.length) return "";
    return messages[activeIndex] ?? messages[0] ?? "";
  }, [activeIndex, messages]);

  if (!current) return null;
 //bg-[linear-gradient(90deg,#8F6E22_0%,#B89235_18%,#C9A84C_38%,#E0C56F_50%,#C9A84C_62%,#A8822D_82%,#7A5C18_100%)]
  return (
    <div className="py-2 bg-deep-black w-full">
      <div className="mx-auto flex items-center justify-center gap-2 px-3 text-xs font-medium text-white">
        <button
          type="button"
          className="px-1 hover:text-black"
          onClick={() =>
            setActiveIndex((prev) => (prev - 1 + messages.length) % messages.length)
          }
          aria-label="Previous announcement"
        >
          {"<"}
        </button>
        <div className="min-w-0 flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.span
              key={`${activeIndex}-${current}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="truncate inline-block max-w-full uppercase"
            >
              {current}
            </motion.span>
          </AnimatePresence>
        </div>
        <button
          type="button"
          className="px-1 hover:text-black"
          onClick={() => setActiveIndex((prev) => (prev + 1) % messages.length)}
          aria-label="Next announcement"
        >
          {">"}
        </button>
      </div>
    </div>
  );
};
