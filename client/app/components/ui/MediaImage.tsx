"use client";

import Image, { type ImageProps } from "next/image";
import clsx from "clsx";

type Props = Omit<ImageProps, "src" | "alt"> & {
  src?: string | null;
  alt: string;
};

function shouldDisableOptimization(src: string): boolean {
  const s = src.toLowerCase();
  return s.includes("/storage/") || s.startsWith("data:") || s.startsWith("blob:");
}

export function MediaImage({ src, alt, className, unoptimized, ...props }: Props) {
  const normalized = (src || "").trim();
  if (!normalized) return null;

  return (
    <Image
      {...props}
      src={normalized}
      alt={alt}
      unoptimized={unoptimized ?? shouldDisableOptimization(normalized)}
      className={clsx(className)}
    />
  );
}

export default MediaImage;
