import { videoSource } from "@/lib/blog";
import { cn } from "@/lib/utils";

export function VideoEmbed({ url, title, className, autoPlay }: { url: string; title?: string; className?: string; autoPlay?: boolean }) {
  const source = videoSource(url);
  if (!source) return null;

  return (
    <div className={cn("relative aspect-video w-full overflow-hidden rounded-xl bg-black", className)}>
      {source.kind === "iframe" ? (
        <iframe
          src={autoPlay ? `${source.src}?autoplay=1` : source.src}
          title={title || source.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
          allowFullScreen
          className="absolute inset-0 size-full border-0"
        />
      ) : (
        <video src={source.src} controls playsInline preload="metadata" autoPlay={autoPlay} className="absolute inset-0 size-full object-contain">
          <track kind="captions" />
        </video>
      )}
    </div>
  );
}
