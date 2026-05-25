"use client";

import { Toaster } from "sonner";

export default function AppToaster() {
  return (
    <Toaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        className:
          "border border-black/10 bg-white text-black shadow-xl",
        duration: 3000,
      }}
    />
  );
}