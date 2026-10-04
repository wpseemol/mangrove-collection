import { API_URL } from "@/lib/config";

/** Post pages are `/blog/post/?slug=...`: a static export can't emit routes for posts written after the build. */
export const postHref = (slug: string) => `/blog/post/?slug=${encodeURIComponent(slug)}`;

export const blogCategoryHref = (slug: string) => `/blog/?category=${encodeURIComponent(slug)}`;

export const formatPostDate = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "";

/** Mirrors `services/blog.ts` in the API. Players are always rebuilt from a parsed id, never from the stored URL. */
export function youtubeId(url: string): string | null {
  try {
    const { hostname, pathname, searchParams, protocol } = new URL(url);
    if (!/^https?:$/.test(protocol)) return null;
    const host = hostname.replace(/^(?:www\.|m\.)/, "");
    let candidate: string | null = null;
    if (host === "youtu.be") candidate = pathname.slice(1).split("/")[0];
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      candidate = pathname === "/watch" ? searchParams.get("v") : (/^\/(?:embed|shorts|live)\/([^/]+)/.exec(pathname)?.[1] ?? null);
    }
    return candidate && /^[A-Za-z0-9_-]{11}$/.test(candidate) ? candidate : null;
  } catch {
    return null;
  }
}

export function vimeoId(url: string): string | null {
  try {
    const { hostname, pathname, protocol } = new URL(url);
    if (!/^https?:$/.test(protocol)) return null;
    const host = hostname.replace(/^www\./, "");
    const match = host === "vimeo.com" ? /^\/(?:.*\/)?(\d{6,12})$/.exec(pathname) : host === "player.vimeo.com" ? /^\/video\/(\d{6,12})$/.exec(pathname) : null;
    return match?.[1] ?? null;
  } catch {
    return null;
  }
}

const STORAGE_PREFIX = `${new URL(API_URL).origin}/storage/uploads/`;

/** Only files the API stored itself are played with `<video>`. */
export const isUploadedVideo = (url: string) => url.startsWith(STORAGE_PREFIX) && /^[\w/-]+\.(?:mp4|webm)$/i.test(url.slice(STORAGE_PREFIX.length));

export type VideoSource = { kind: "iframe"; src: string; title: string } | { kind: "file"; src: string };

export function videoSource(url: string): VideoSource | null {
  const youtube = youtubeId(url);
  if (youtube) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${youtube}`, title: "YouTube video" };
  const vimeo = vimeoId(url);
  if (vimeo) return { kind: "iframe", src: `https://player.vimeo.com/video/${vimeo}`, title: "Vimeo video" };
  return isUploadedVideo(url) ? { kind: "file", src: url } : null;
}

export const plainText = (html: string) =>
  html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
