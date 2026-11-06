"use client";

import Image from "next/image";
import { useState, type CSSProperties } from "react";

import { NO_IMAGE } from "@/lib/config";
import { cn } from "@/lib/utils";

type RemoteImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  style?: CSSProperties;
};

/** Fills its (relatively positioned) parent and falls back to a placeholder on error. */
export function RemoteImage({ src, alt, className, sizes = "(max-width: 768px) 50vw, 20vw", priority, style }: RemoteImageProps) {
  const [failed, setFailed] = useState(false);

  return (
    <Image
      src={!src || failed ? NO_IMAGE : src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      style={style}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  );
}
