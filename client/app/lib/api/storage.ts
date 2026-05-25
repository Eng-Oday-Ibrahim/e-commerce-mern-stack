import api from "@/lib/utils/axios";
import type { ApiOkResponse } from "./types";

export type StorageFolder = "products" | "collections" | "lookbooks" | "hero";

export const StorageApi = {
  upload: async (input: {
    folder: StorageFolder;
    filename?: string;
    mimeType?: string;
    contentBase64: string;
  }) => {
    const res = await api.post<ApiOkResponse<{ url: string }>>("/api/storage/upload", input);
    return res.data;
  },
};
