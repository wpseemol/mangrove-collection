"use client";

import { ChevronLeft, ChevronRight, Play, X } from "lucide-react";
import { useState } from "react";

import { VideoEmbed } from "@/components/blog/video-embed";
import { RemoteImage } from "@/components/shared/remote-image";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { videoSource } from "@/lib/blog";
import type { BlogMedia } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Photos and videos attached to a post, opened full screen with arrow-key navigation. */
export function BlogGallery({ media, title }: { media: BlogMedia[]; title: string }) {
  const items = media.filter((item) => item.type === "image" || videoSource(item.url));
  const [open, setOpen] = useState<number | null>(null);

  if (items.length === 0) return null;

  const current = open === null ? null : items[open];
  const go = (step: number) => setOpen((index) => (index === null ? null : (index + step + items.length) % items.length));
  const images = items.filter((item) => item.type === "image").length;
  const videos = items.length - images;

  return (
    <section aria-labelledby="gallery-heading" className="mt-12">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 id="gallery-heading" className="font-heading text-2xl font-semibold text-foreground">
          Gallery
        </h2>
        <p className="text-sm text-muted-foreground">
          {[images && `${images} photo${images === 1 ? "" : "s"}`, videos && `${videos} video${videos === 1 ? "" : "s"}`].filter(Boolean).join(" · ")}
        </p>
      </div>

      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((item, index) => (
          <li key={item.id} className={cn(items.length > 2 && index === 0 && "col-span-2 row-span-2")}>
            <button
              type="button"
              onClick={() => setOpen(index)}
              className="group relative block aspect-square size-full overflow-hidden rounded-xl bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              aria-label={`${item.type === "video" ? "Play video" : "Open photo"} ${index + 1}${item.caption ? `: ${item.caption}` : ""}`}
            >
              {item.thumbnail ? (
                <RemoteImage src={item.thumbnail} alt={item.caption ?? ""} sizes="(max-width: 640px) 50vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
              ) : videoSource(item.url)?.kind === "file" ? (
                <video src={`${item.url}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 size-full object-cover" />
              ) : (
                <span className="absolute inset-0 bg-gradient-to-br from-forest to-primary" />
              )}
              {item.type === "video" && (
                <span className="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30">
                  <span className="flex size-12 items-center justify-center rounded-full bg-white/90 text-primary shadow-lg">
                    <Play className="ml-0.5 size-5 fill-current" />
                  </span>
                </span>
              )}
              {item.caption && (
                <span className="absolute inset-x-0 bottom-0 line-clamp-1 bg-gradient-to-t from-black/70 to-transparent px-3 pt-6 pb-2 text-left text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {item.caption}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={current !== null} onOpenChange={(value) => !value && setOpen(null)}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-0 border-0 bg-black p-0 text-white ring-0 sm:max-w-5xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            if (event.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{title} — gallery</DialogTitle>
          <DialogDescription className="sr-only">Use the arrow keys to move between items.</DialogDescription>
          {current && (
            <>
              <div className="relative flex max-h-[80vh] min-h-64 items-center justify-center">
                {current.type === "video" ? (
                  <VideoEmbed key={current.id} url={current.url} title={current.caption ?? undefined} autoPlay className="rounded-none" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={current.url} alt={current.caption ?? ""} className="max-h-[80vh] w-auto object-contain" />
                )}
              </div>
              <div className="flex items-center gap-3 px-4 py-3 text-sm">
                <span className="tabular-nums text-white/60">
                  {open! + 1} / {items.length}
                </span>
                <p className="line-clamp-2 flex-1 text-white/90">{current.caption}</p>
              </div>
            </>
          )}
          {items.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous"
                className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next"
                className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
          <DialogClose className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70" aria-label="Close">
            <X className="size-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </section>
  );
}
