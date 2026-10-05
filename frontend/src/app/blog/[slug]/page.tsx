import { ArrowLeft, ArrowRight, CalendarDays, Clock, Eye, ListTree } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, permanentRedirect } from "next/navigation";
import { cache } from "react";

import { BlogContent } from "@/components/blog/blog-content";
import { BlogGallery } from "@/components/blog/blog-gallery";
import { CategoryPill, PostCard } from "@/components/blog/post-card";
import { LikeCallout, PostActions, PostComments } from "@/components/blog/post-engagement";
import { Container } from "@/components/shared/container";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { RemoteImage } from "@/components/shared/remote-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { blogCategoryHref, blogTagHref, formatPostDate, plainText, postHref, withHeadingIds } from "@/lib/blog";
import { clip, toAbsolute } from "@/lib/head";
import { absoluteUrl, jsonLd, OG_IMAGE, pageMetadata, SITE_NAME } from "@/lib/seo";
import { getBlogPost, NotFoundError } from "@/lib/server-api";
import type { BlogPost } from "@/lib/types";

type Params = Promise<{ slug: string }>;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

const loadPost = cache(async (slug: string) => {
  try {
    return await getBlogPost(decodeURIComponent(slug));
  } catch (error) {
    if (error instanceof NotFoundError) return null;
    throw error;
  }
});

const describe = (post: BlogPost) => clip(post.meta_description || post.excerpt || plainText(post.content ?? "") || `${post.title} — ${SITE_NAME} blog.`, 160);
const coverOf = (post: BlogPost) => post.cover_image || post.media?.find((item) => item.type === "image")?.url || null;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const result = await loadPost(slug);
  if (!result) return pageMetadata({ title: "Article not found", description: "This article may have been moved or is no longer published.", noindex: true });
  const post = result.data;
  return pageMetadata({
    title: post.meta_title || post.title,
    description: describe(post),
    path: postHref(post.slug),
    image: coverOf(post),
    keywords: post.tags.length ? post.tags : undefined,
    article: {
      publishedTime: post.published_at,
      modifiedTime: post.updated_at,
      authors: post.author ? [post.author.name] : undefined,
      section: post.category?.name,
      tags: post.tags,
    },
  });
}

function postJsonLd(post: BlogPost) {
  const url = absoluteUrl(postHref(post.slug));
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: describe(post),
        url,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        image: [toAbsolute(coverOf(post) || OG_IMAGE.url)],
        ...(post.published_at ? { datePublished: post.published_at } : {}),
        ...(post.updated_at ? { dateModified: post.updated_at } : {}),
        ...(post.author ? { author: { "@type": "Person", name: post.author.name } } : {}),
        publisher: { "@type": "Organization", name: SITE_NAME, logo: { "@type": "ImageObject", url: absoluteUrl("/assets/logo.png") } },
        ...(post.tags.length ? { keywords: post.tags.join(", ") } : {}),
        ...(post.category ? { articleSection: post.category.name } : {}),
        wordCount: plainText(post.content ?? "").split(" ").filter(Boolean).length,
        inLanguage: "en",
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
}

export default async function BlogPostPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const { slug } = await params;
  if (slug === "post") {
    const legacy = (await searchParams).slug;
    if (typeof legacy === "string" && legacy) permanentRedirect(postHref(legacy));
  }

  const result = await loadPost(slug);
  if (!result) notFound();
  const { data: post, related } = result;
  const { html, headings } = withHeadingIds(post.content ?? "");

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(postJsonLd(post)) }} />
      <Container className="pb-20 md:pb-12">
        <PageBreadcrumb
          items={[
            { label: "Blog", href: "/blog/" },
            ...(post.category ? [{ label: post.category.name, href: blogCategoryHref(post.category.slug) }] : []),
            { label: post.title },
          ]}
        />

        <article>
          <header className="mx-auto max-w-3xl pt-2 pb-8 text-center">
            {post.category && (
              <Link href={blogCategoryHref(post.category.slug)} className="inline-block transition-opacity hover:opacity-80">
                <CategoryPill category={post.category} />
              </Link>
            )}
            <h1 className="font-heading mt-4 text-3xl leading-tight font-semibold tracking-tight text-balance text-foreground md:text-5xl">{post.title}</h1>
            {post.excerpt && <p className="mx-auto mt-4 max-w-2xl text-lg text-pretty text-muted-foreground">{post.excerpt}</p>}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {post.author && (
                <span className="inline-flex items-center gap-2 font-medium text-foreground">
                  <Avatar className="size-8">
                    <AvatarImage src={post.author.avatar ?? undefined} alt="" />
                    <AvatarFallback className="bg-secondary text-xs text-primary">{post.author.name[0]}</AvatarFallback>
                  </Avatar>
                  {post.author.name}
                </span>
              )}
              {post.published_at && (
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-4" />
                  <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <Clock className="size-4" /> {post.reading_minutes} min read
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Eye className="size-4" /> {post.views.toLocaleString("en-US")} views
              </span>
            </div>
            <div className="mt-6 flex justify-center">
              <PostActions slug={post.slug} title={post.title} track />
            </div>
          </header>

          {post.cover_image && (
            <div className="relative mx-auto mb-10 aspect-video max-w-5xl overflow-hidden rounded-2xl bg-muted md:rounded-3xl">
              <RemoteImage src={post.cover_image} alt={post.title} sizes="(max-width: 1024px) 100vw, 1024px" priority />
            </div>
          )}

          <div className="mx-auto grid max-w-5xl gap-10 lg:grid-cols-[minmax(0,1fr)_14rem]">
            <div className="min-w-0">
              {headings.length >= 3 && (
                <details className="mb-8 rounded-2xl border bg-surface p-4 lg:hidden" open>
                  <summary className="flex cursor-pointer items-center gap-2 font-semibold text-foreground">
                    <ListTree className="size-4 text-primary" /> In this article
                  </summary>
                  <ol className="mt-3 space-y-2 pl-6 text-sm">
                    {headings.map((heading) => (
                      <li key={heading.id} className="list-decimal text-muted-foreground marker:text-primary">
                        <a href={`#${heading.id}`} className="hover:text-primary">
                          {heading.text}
                        </a>
                      </li>
                    ))}
                  </ol>
                </details>
              )}

              {html && <BlogContent html={html} />}
              {post.media && <BlogGallery media={post.media} title={post.title} />}

              {post.tags.length > 0 && (
                <ul className="mt-10 flex flex-wrap gap-2" aria-label="Tags">
                  {post.tags.map((tag) => (
                    <li key={tag}>
                      <Link
                        href={blogTagHref(tag)}
                        rel="tag"
                        className="inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                      >
                        #{tag}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-10 space-y-10">
                <LikeCallout slug={post.slug} />

                {post.author && (
                  <div className="flex items-center gap-4 rounded-2xl border p-5">
                    <Avatar className="size-14">
                      <AvatarImage src={post.author.avatar ?? undefined} alt="" />
                      <AvatarFallback className="bg-secondary text-lg text-primary">{post.author.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">Written by</p>
                      <p className="font-heading text-lg font-semibold text-foreground">{post.author.name}</p>
                      <p className="text-sm text-muted-foreground">Part of the {SITE_NAME} team, bringing you honey and seafood straight from the Sundarbans.</p>
                    </div>
                  </div>
                )}

                <PostComments slug={post.slug} />

                <Button asChild variant="ghost" className="px-0 text-primary hover:bg-transparent">
                  <Link href="/blog/">
                    <ArrowLeft /> Back to all articles
                  </Link>
                </Button>
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-6">
                {headings.length >= 3 && (
                  <nav aria-label="Table of contents" className="rounded-2xl border bg-surface p-4">
                    <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ListTree className="size-4 text-primary" /> In this article
                    </p>
                    <ol className="space-y-2 border-l pl-3 text-sm">
                      {headings.map((heading) => (
                        <li key={heading.id}>
                          <a href={`#${heading.id}`} className="line-clamp-2 text-muted-foreground hover:text-primary">
                            {heading.text}
                          </a>
                        </li>
                      ))}
                    </ol>
                  </nav>
                )}
                <div className="rounded-2xl bg-primary p-5 text-white">
                  <p className="font-heading text-lg font-semibold">Pure Sundarbans honey & fresh seafood</p>
                  <p className="mt-1 text-sm text-white/80">Delivered to all 64 districts.</p>
                  <Button asChild size="sm" variant="secondary" className="mt-4 rounded-full">
                    <Link href="/shop/">
                      Shop now <ArrowRight />
                    </Link>
                  </Button>
                </div>
              </div>
            </aside>
          </div>
        </article>

        {related.length > 0 && (
          <section className="mt-16 border-t pt-12" aria-labelledby="related-title">
            <div className="mb-6 flex items-end justify-between gap-4">
              <h2 id="related-title" className="font-heading text-2xl font-semibold text-foreground">
                Keep reading
              </h2>
              {post.category && (
                <Link href={blogCategoryHref(post.category.slug)} className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                  More in {post.category.name} <ArrowRight className="size-4" />
                </Link>
              )}
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <PostCard key={item.id} post={item} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  );
}
