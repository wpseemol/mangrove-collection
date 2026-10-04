"use client";

import { useEffect } from "react";

import { blogCategoryHref, plainText, postHref } from "@/lib/blog";
import { canonical, clip, meta, toAbsolute } from "@/lib/head";
import { absoluteUrl, jsonLd, OG_IMAGE, SITE_NAME } from "@/lib/seo";
import type { BlogPost } from "@/lib/types";

/** Post pages are `/blog/post/?slug=...`, so the head tags and BlogPosting data are filled in once the post loads. */
export function BlogPostSeo({ post }: { post: BlogPost }) {
  const url = absoluteUrl(postHref(post.slug));
  const title = `${post.meta_title || post.title} | ${SITE_NAME}`;
  const description = clip(post.meta_description || post.excerpt || plainText(post.content ?? "") || `${post.title} — ${SITE_NAME} blog.`, 160);
  const image = toAbsolute(post.cover_image || post.media?.find((item) => item.type === "image")?.url || OG_IMAGE.url);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;
    const undo = [
      meta("name", "description", description),
      canonical(url),
      meta("property", "og:type", "article"),
      meta("property", "og:title", title),
      meta("property", "og:description", description),
      meta("property", "og:url", url),
      meta("property", "og:image", image),
      meta("name", "twitter:title", title),
      meta("name", "twitter:description", description),
      meta("name", "twitter:image", image),
      ...(post.published_at ? [meta("property", "article:published_time", post.published_at)] : []),
    ];

    return () => {
      document.title = previousTitle;
      undo.forEach((restore) => restore());
    };
  }, [title, description, url, image, post.published_at]);

  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description,
        url,
        mainEntityOfPage: url,
        image: [image],
        ...(post.published_at ? { datePublished: post.published_at } : {}),
        ...(post.updated_at ? { dateModified: post.updated_at } : {}),
        ...(post.author ? { author: { "@type": "Person", name: post.author.name } } : {}),
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/assets/logo.png") } },
        ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
        ...(post.category ? { articleSection: post.category.name } : {}),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { name: "Home", item: absoluteUrl("/") },
          { name: "Blog", item: absoluteUrl("/blog/") },
          ...(post.category ? [{ name: post.category.name, item: absoluteUrl(blogCategoryHref(post.category.slug)) }] : []),
          { name: post.title, item: url },
        ].map((crumb, index) => ({ "@type": "ListItem", position: index + 1, ...crumb })),
      },
    ],
  };

  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
