import axios from "axios";
import type { ApiErrorResponse } from "@/api/types";
import { getUiLang } from "@/lib/i18n/lang";
import { messagesByLang } from "@/lib/i18n/messages";

export function getApiErrorMessage(err: unknown): string {
  const m = messagesByLang[getUiLang()];
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as Partial<ApiErrorResponse> | undefined;
    const code = typeof data?.code === "string" ? data.code : "";
    if (code === "invalid_credentials") return m.errors.invalidCredentials;
    if (code === "unauthorized" || code === "forbidden") return m.errors.unauthorized;
    if (code === "invalid_token") return m.errors.invalidToken;
    if (data?.message) return data.message;
    return err.message || m.errors.requestFailed;
  }

  if (err instanceof Error) return err.message;
  return m.errors.unexpected;
}
