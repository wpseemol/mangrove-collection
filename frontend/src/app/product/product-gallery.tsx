"use client";

import { ChevronLeft, ChevronRight, Expand, X, ZoomIn } from "lucide-react";
import { useCallback, useRef, useState } from "react";

import { RemoteImage } from "@/components/shared/remote-image";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type ProductGalleryProps = {
  images: string[];
  alt: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

/** Main product image with hover zoom and a full-screen lightbox viewer. */
export function ProductGallery({ images, alt, activeIndex, onIndexChange }: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  const active = images[activeIndex] ?? images[0];
  const count = images.length;

  const go = useCallback(
    (step: number) => {
      if (count < 2) return;
      onIndexChange((activeIndex + step + count) % count);
    },
    [activeIndex, count, onIndexChange],
  );

  const onMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    const rect = stageRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.min(100, Math.max(0, x)), y: Math.min(100, Math.max(0, y)) });
  };

  if (!active) return null;

  return (
    <div className="space-y-3">
      <div
        ref={stageRef}
        role="button"
        tabIndex={0}
        onClick={() => setLightboxOpen(true)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setLightboxOpen(true);
          }
        }}
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover) and (pointer: fine)").matches) setZooming(true);
        }}
        onMouseLeave={() => setZooming(false)}
        onMouseMove={onMove}
        aria-label={`View ${alt} full size`}
        className="group relative aspect-square cursor-zoom-in overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:rounded-3xl"
      >
        <RemoteImage
          src={active}
          alt={alt}
          sizes="(max-width: 768px) 100vw, 50vw"
          priority
          className={cn("transition-transform duration-200 ease-out", zooming && "scale-[1.85]")}
          style={zooming ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
        />
        <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-border backdrop-blur">
          <Expand className="size-3.5" /> Full view
        </span>
        <span className="pointer-events-none absolute top-3 right-3 hidden size-9 items-center justify-center rounded-full bg-card/95 text-primary opacity-0 shadow-sm ring-1 ring-border backdrop-blur transition-opacity group-hover:opacity-100 md:flex">
          <ZoomIn className="size-4" />
        </span>
      </div>

      {count > 1 && (
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {images.map((src, index) => (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => onIndexChange(index)}
              aria-label={`Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-muted transition-all",
                index === activeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <RemoteImage src={src} alt="" sizes="100px" />
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden border border-border bg-card p-0 text-foreground shadow-xl ring-1 ring-foreground/5 sm:max-w-5xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") go(1);
            if (event.key === "ArrowLeft") go(-1);
          }}
        >
          <DialogTitle className="sr-only">{alt} — full view</DialogTitle>
          <DialogDescription className="sr-only">Use the arrow keys to move between product photos.</DialogDescription>

          <div className="relative flex max-h-[85vh] min-h-64 items-center justify-center bg-surface p-3 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox needs unconstrained object-contain sizing */}
            <img src={active} alt={alt} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />
          </div>

          <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3 text-sm">
            {count > 1 ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium tabular-nums text-primary">
                {activeIndex + 1} / {count}
              </span>
            ) : null}
            <p className="line-clamp-1 flex-1 font-medium text-foreground">{alt}</p>
          </div>

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => go(-1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm hover:bg-secondary"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => go(1)}
                aria-label="Next image"
                className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm hover:bg-secondary"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}

          <DialogClose
            className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:bg-secondary hover:text-primary"
            aria-label="Close"
          >
            <X className="size-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}
