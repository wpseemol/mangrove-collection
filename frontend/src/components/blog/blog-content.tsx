import { Fragment } from "react";

import { VideoEmbed } from "@/components/blog/video-embed";

type Part = { html: string } | { video: string };

const FIGURE = /<figure\b([^>]*)>\s*<\/figure>/gi;

const decode = (value: string) =>
  value.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

/**
 * Splits the post body at the `<figure data-video data-src>` placeholders the editor stores in place of players.
 * The HTML between them was checked against the API's allowlist when it was saved.
 */
function split(html: string): Part[] {
  const parts: Part[] = [];
  let last = 0;
  for (const match of html.matchAll(FIGURE)) {
    const src = /\bdata-src="([^"]*)"/.exec(match[1])?.[1];
    if (match.index > last) parts.push({ html: html.slice(last, match.index) });
    if (src) parts.push({ video: decode(src) });
    last = match.index + match[0].length;
  }
  if (last < html.length) parts.push({ html: html.slice(last) });
  return parts;
}

export function BlogContent({ html }: { html: string }) {
  const body = html.replace(/<img\b/gi, '<img loading="lazy" decoding="async"');

  return (
    <div className="blog-content">
      {split(body).map((part, index) => (
        <Fragment key={index}>
          {"html" in part ? (
            <div className="contents" dangerouslySetInnerHTML={{ __html: part.html }} />
          ) : (
            <figure>
              <VideoEmbed url={part.video} />
            </figure>
          )}
        </Fragment>
      ))}
    </div>
  );
}
