import type { Lang } from "../lang";

import enRaw from "./en.json";
import arRaw from "./ar.json";

type RawMessages = typeof enRaw;

export type Messages = Omit<RawMessages, "pages"> & {
  pages: Omit<RawMessages["pages"], "shop"> & {
    shop: Omit<RawMessages["pages"]["shop"], "countPattern"> & {
      count: (n: number) => string;
    };
  };
};

function withRuntime(raw: RawMessages): Messages {
  return {
    ...raw,
    pages: {
      ...raw.pages,
      shop: {
        ...raw.pages.shop,
        count: (n: number) => raw.pages.shop.countPattern.replace("{n}", String(n)),
      },
    },
  };
}

export const messagesByLang: Record<Lang, Messages> = {
  en: withRuntime(enRaw),
  ar: withRuntime(arRaw),
};

