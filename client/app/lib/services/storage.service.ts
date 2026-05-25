import { StorageApi, type StorageFolder } from "@/lib/api/storage";
import { Toast } from "@/lib/utils/toast";
import { getApiErrorMessage } from "@/lib/utils/apiError";
import { resolveMediaUrl } from "@/lib/utils/mediaUrl";

async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(",")[1] || "";
      resolve(base64);
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export const StorageService = {
  uploadImage: async (folder: StorageFolder, file: File) => {
    try {
      const contentBase64 = await fileToBase64(file);
      const res = await StorageApi.upload({
        folder,
        filename: file.name,
        mimeType: file.type,
        contentBase64,
      });
      return { url: resolveMediaUrl(res.url) };
    } catch (err) {
      Toast.error(getApiErrorMessage(err));
      throw err;
    }
  },
};
