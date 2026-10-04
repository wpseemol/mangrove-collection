"use client";

import { ArrowLeft, CalendarDays, Check, Clock, Eye, Link2, Newspaper } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { BlogContent } from "@/components/blog/blog-content";
import { BlogGallery } from "@/components/blog/blog-gallery";
import { CategoryPill, PostCard } from "@/components/blog/post-card";
import { FacebookIcon, WhatsAppIcon } from "@/components/layout/social-icons";
import { BlogPostSeo } from "@/components/seo/blog-post-seo";
import { Container } from "@/components/shared/container";
import { EmptyState } from "@/components/shared/empty-state";
import { PageBreadcrumb } from "@/components/shared/page-breadcrumb";
import { RemoteImage } from "@/components/shared/remote-image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { blogCategoryHref, formatPostDate, postHref } from "@/lib/blog";
import { useBlogPost } from "@/lib/queries";
import { absoluteUrl } from "@/lib/seo";

function ShareButtons({ title, slug }: { title: string; slug: string }) {
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(postHref(slug));
  const encoded = encodeURIComponent(url);

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Share</span>
      <Button asChild variant="outline" size="icon-sm" className="rounded-full">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <FacebookIcon className="size-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="icon-sm" className="rounded-full">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
          <WhatsAppIcon className="size-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon-sm" className="rounded-full" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <Check className="text-primary" /> : <Link2 />}
      </Button>
    </div>
  );
}

function PostSkeleton() {
  return (
    <div className="mx-auto max-w-3xl space-y-5 py-8">
      <Skeleton className="h-5 w-28" />
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="aspect-video w-full rounded-2xl" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

export function BlogPostView() {
  const slug = useSearchParams().get("slug");
  const { data, isLoading, isError } = useBlogPost(slug);

  if (!slug || isError) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={Newspaper}
          title="Article not found"
          description="This article may have been moved or is no longer published."
          action={
            <Button asChild>
              <Link href="/blog">Browse the blog</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  if (isLoading || !data) {
    return (
      <Container>
        <PostSkeleton />
      </Container>
    );
  }

  const { data: post, related } = data;

  return (
    <Container className="pb-20 md:pb-10">
      <BlogPostSeo post={post} />
      <PageBreadcrumb
        items={[
          { label: "Blog", href: "/blog" },
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
              <Eye className="size-4" /> {post.views.toLocaleString()} views
            </span>
          </div>
        </header>

        {post.cover_image && (
          <div className="relative mx-auto mb-10 aspect-video max-w-5xl overflow-hidden rounded-2xl bg-muted md:rounded-3xl">
            <RemoteImage src={post.cover_image} alt={post.title} sizes="(max-width: 1024px) 100vw, 1024px" priority />
          </div>
        )}

        <div className="mx-auto max-w-3xl">
          {post.content && <BlogContent html={post.content} />}

          {post.media && <BlogGallery media={post.media} title={post.title} />}

          <footer className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-6">
            {post.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag}>
                    <Link
                      href={`/blog/?tag=${encodeURIComponent(tag)}`}
                      className="inline-flex rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      #{tag}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <span />
            )}
            <ShareButtons title={post.title} slug={post.slug} />
          </footer>

          <Button asChild variant="ghost" className="mt-6 px-0 text-primary hover:bg-transparent">
            <Link href="/blog">
              <ArrowLeft /> Back to all articles
            </Link>
          </Button>
        </div>
      </article>

      {related.length > 0 && (
        <section className="mt-16 border-t pt-12">
          <h2 className="font-heading mb-6 text-2xl font-semibold text-foreground">Keep reading</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <PostCard key={item.id} post={item} />
            ))}
          </div>
        </section>
      )}
    </Container>
  );
}
