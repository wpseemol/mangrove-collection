"use client";

import { ChevronLeft, ChevronRight, Expand, Play, X, ZoomIn } from "lucide-react";
import { useCallback, useMemo, useRef, useState } from "react";

import { VideoEmbed } from "@/components/blog/video-embed";
import { RemoteImage } from "@/components/shared/remote-image";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { isUploadedVideo, videoSource, youtubeId } from "@/lib/blog";
import { cn } from "@/lib/utils";

type ImageItem = { type: "image"; src: string };
type VideoItem = { type: "video"; url: string };
type MediaItem = ImageItem | VideoItem;

type ProductGalleryProps = {
  images: string[];
  videoUrl?: string | null;
  alt: string;
  activeIndex: number;
  onIndexChange: (index: number) => void;
};

function videoPoster(url: string, fallback?: string | null) {
  const youtube = youtubeId(url);
  if (youtube) return `https://i.ytimg.com/vi/${youtube}/hqdefault.jpg`;
  return fallback ?? null;
}

/** Main product media with hover zoom for photos and a popup player for video. */
export function ProductGallery({ images, videoUrl, alt, activeIndex, onIndexChange }: ProductGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);
  const [zooming, setZooming] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const stageRef = useRef<HTMLDivElement>(null);

  const items = useMemo<MediaItem[]>(() => {
    const media: MediaItem[] = images.map((src) => ({ type: "image", src }));
    if (videoUrl && videoSource(videoUrl)) media.push({ type: "video", url: videoUrl });
    return media;
  }, [images, videoUrl]);

  const count = items.length;
  const active = items[activeIndex] ?? items[0];
  const posterFallback = images[0] ?? null;

  const goImage = useCallback(
    (step: number) => {
      const imageIndexes = items
        .map((item, index) => (item.type === "image" ? index : -1))
        .filter((index) => index >= 0);
      if (imageIndexes.length < 2) return;
      const current = imageIndexes.indexOf(activeIndex);
      const next = imageIndexes[(current < 0 ? 0 : current + step + imageIndexes.length) % imageIndexes.length];
      onIndexChange(next);
    },
    [activeIndex, items, onIndexChange],
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

  const isVideo = active.type === "video";
  const activeImage = active.type === "image" ? active.src : null;
  const activeVideo = active.type === "video" ? active.url : null;
  const imageCount = items.filter((item) => item.type === "image").length;

  return (
    <div className="space-y-3">
      {isVideo && activeVideo ? (
        <button
          type="button"
          onClick={() => setVideoOpen(true)}
          aria-label={`Play ${alt} video`}
          className="group relative aspect-square w-full cursor-pointer overflow-hidden rounded-2xl border bg-muted outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:rounded-3xl"
        >
          <VideoPreview url={activeVideo} fallback={posterFallback} alt={alt} />
          <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition-colors group-hover:bg-black/35">
            <span className="flex size-16 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg ring-1 ring-border transition-transform group-hover:scale-105">
              <Play className="ml-1 size-7 fill-current" />
            </span>
          </span>
          <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-border backdrop-blur">
            <Play className="size-3.5 fill-current" /> Play video
          </span>
        </button>
      ) : (
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
          {activeImage && (
            <RemoteImage
              src={activeImage}
              alt={alt}
              sizes="(max-width: 768px) 100vw, 50vw"
              priority
              className={cn("transition-transform duration-200 ease-out", zooming && "scale-[1.85]")}
              style={zooming ? { transformOrigin: `${origin.x}% ${origin.y}%` } : undefined}
            />
          )}
          <span className="pointer-events-none absolute right-3 bottom-3 flex items-center gap-1.5 rounded-full bg-card/95 px-2.5 py-1 text-xs font-medium text-primary shadow-sm ring-1 ring-border backdrop-blur">
            <Expand className="size-3.5" /> Full view
          </span>
          <span className="pointer-events-none absolute top-3 right-3 hidden size-9 items-center justify-center rounded-full bg-card/95 text-primary opacity-0 shadow-sm ring-1 ring-border backdrop-blur transition-opacity group-hover:opacity-100 md:flex">
            <ZoomIn className="size-4" />
          </span>
        </div>
      )}

      {count > 1 && (
        <div className="grid grid-cols-5 gap-2 md:gap-3">
          {items.map((item, index) => (
            <button
              key={item.type === "image" ? `${item.src}-${index}` : `video-${index}`}
              type="button"
              onClick={() => onIndexChange(index)}
              aria-label={item.type === "video" ? "Show video" : `Show image ${index + 1}`}
              aria-current={index === activeIndex}
              className={cn(
                "relative aspect-square overflow-hidden rounded-xl border-2 bg-muted transition-all",
                index === activeIndex ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              {item.type === "image" ? (
                <RemoteImage src={item.src} alt="" sizes="100px" />
              ) : (
                <>
                  <VideoPreview url={item.url} fallback={posterFallback} alt="" />
                  <span className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="flex size-7 items-center justify-center rounded-full bg-white/95 text-primary shadow-sm">
                      <Play className="ml-0.5 size-3.5 fill-current" />
                    </span>
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden border border-border bg-card p-0 text-foreground shadow-xl ring-1 ring-foreground/5 sm:max-w-5xl"
          onKeyDown={(event) => {
            if (event.key === "ArrowRight") goImage(1);
            if (event.key === "ArrowLeft") goImage(-1);
          }}
        >
          <DialogTitle className="sr-only">{alt} — full view</DialogTitle>
          <DialogDescription className="sr-only">Use the arrow keys to move between product photos.</DialogDescription>

          <div className="relative flex max-h-[85vh] min-h-64 items-center justify-center bg-surface p-3 sm:p-6">
            {/* eslint-disable-next-line @next/next/no-img-element -- lightbox needs unconstrained object-contain sizing */}
            {activeImage && <img src={activeImage} alt={alt} className="max-h-[80vh] w-auto max-w-full rounded-lg object-contain" />}
          </div>

          <div className="flex items-center gap-3 border-t border-border bg-card px-4 py-3 text-sm">
            {imageCount > 1 ? (
              <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium tabular-nums text-primary">
                {(items.slice(0, activeIndex + 1).filter((item) => item.type === "image").length || 1)} / {imageCount}
              </span>
            ) : null}
            <p className="line-clamp-1 flex-1 font-medium text-foreground">{alt}</p>
          </div>

          {imageCount > 1 && (
            <>
              <button
                type="button"
                onClick={() => goImage(-1)}
                aria-label="Previous image"
                className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-card text-primary shadow-sm hover:bg-secondary"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => goImage(1)}
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

      <Dialog open={videoOpen} onOpenChange={setVideoOpen}>
        <DialogContent
          showCloseButton={false}
          className="max-w-[calc(100%-1rem)] gap-0 overflow-hidden border-0 bg-black p-0 text-white ring-0 sm:max-w-5xl"
        >
          <DialogTitle className="sr-only">{alt} — video</DialogTitle>
          <DialogDescription className="sr-only">Product video player.</DialogDescription>
          {activeVideo && (
            <div className="relative">
              <VideoEmbed key={activeVideo} url={activeVideo} title={`${alt} video`} autoPlay className="rounded-none" />
            </div>
          )}
          <DialogClose
            className="absolute top-2 right-2 flex size-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur hover:bg-black/70"
            aria-label="Close video"
          >
            <X className="size-5" />
          </DialogClose>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function VideoPreview({ url, fallback, alt }: { url: string; fallback?: string | null; alt: string }) {
  const poster = videoPoster(url, fallback);

  if (poster) {
    return <RemoteImage src={poster} alt={alt} sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />;
  }

  if (isUploadedVideo(url)) {
    return <video src={`${url}#t=0.5`} preload="metadata" muted playsInline className="absolute inset-0 size-full object-cover" />;
  }

  return <span className="absolute inset-0 bg-linear-to-br from-forest to-primary" />;
}
