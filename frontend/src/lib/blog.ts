import { API_URL } from "@/lib/config";

export const postHref = (slug: string) => `/blog/${encodeURIComponent(slug)}/`;

export const blogCategoryHref = (slug: string) => `/blog/category/${encodeURIComponent(slug)}/`;

export const blogTagHref = (tag: string) => `/blog/?tag=${encodeURIComponent(tag)}`;

/** `<h2>` headings of a post body, given ids so the table of contents can link to them. */
export function withHeadingIds(html: string): { html: string; headings: { id: string; text: string }[] } {
  const headings: { id: string; text: string }[] = [];
  const used = new Set<string>();
  const out = html.replace(/<h2\b([^>]*)>([\s\S]*?)<\/h2>/gi, (match, attrs: string, inner: string) => {
    if (/\bid=/i.test(attrs)) return match;
    const text = plainText(inner);
    if (!text) return match;
    let id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 60) || "section";
    for (let n = 2; used.has(id); n++) id = `${id.replace(/-\d+$/, "")}-${n}`;
    used.add(id);
    headings.push({ id, text });
    return `<h2${attrs} id="${id}">${inner}</h2>`;
  });
  return { html: out, headings };
}

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
