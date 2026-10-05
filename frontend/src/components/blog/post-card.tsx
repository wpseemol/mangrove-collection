import { CalendarDays, Clock, Heart, Images, MessageCircle, PlayCircle, Star } from "lucide-react";
import Link from "next/link";

import { IconGlyph } from "@/components/shared/icon-glyph";
import { RemoteImage } from "@/components/shared/remote-image";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPostDate, postHref } from "@/lib/blog";
import type { BlogCategory, BlogPost } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CategoryPill({ category, className }: { category: BlogCategory; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-semibold tracking-wide text-primary uppercase", className)}>
      {category.icon_nodes && <IconGlyph nodes={category.icon_nodes} className="size-3.5" />}
      {category.name}
    </span>
  );
}

function PostMeta({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground", className)}>
      {post.published_at && (
        <span className="inline-flex items-center gap-1">
          <CalendarDays className="size-3.5" />
          <time dateTime={post.published_at}>{formatPostDate(post.published_at)}</time>
        </span>
      )}
      <span className="inline-flex items-center gap-1">
        <Clock className="size-3.5" /> {post.reading_minutes} min read
      </span>
      {!!post.likes_count && (
        <span className="inline-flex items-center gap-1" title="Likes">
          <Heart className="size-3.5" /> {post.likes_count}
        </span>
      )}
      {!!post.comments_count && (
        <span className="inline-flex items-center gap-1" title="Comments">
          <MessageCircle className="size-3.5" /> {post.comments_count}
        </span>
      )}
    </div>
  );
}

function MediaBadges({ post }: { post: BlogPost }) {
  if (!post.images_count && !post.videos_count && !post.is_featured) return null;
  return (
    <div className="absolute top-3 left-3 flex gap-1.5">
      {post.is_featured && (
        <span className="inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-[11px] font-semibold text-white shadow-sm">
          <Star className="size-3 fill-current" /> Featured
        </span>
      )}
      {!!post.videos_count && (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <PlayCircle className="size-3" /> {post.videos_count}
        </span>
      )}
      {!!post.images_count && (
        <span className="inline-flex items-center gap-1 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur">
          <Images className="size-3" /> {post.images_count}
        </span>
      )}
    </div>
  );
}

export function PostCard({ post, layout = "grid" }: { post: BlogPost; layout?: "grid" | "list" }) {
  const href = postHref(post.slug);

  if (layout === "list") {
    return (
      <article className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border bg-card p-3 transition-shadow hover:shadow-md sm:flex-row sm:gap-6">
        <div className="relative aspect-video shrink-0 overflow-hidden rounded-xl bg-muted sm:w-72">
          <RemoteImage src={post.cover_image} alt="" sizes="(max-width: 640px) 100vw, 288px" className="transition-transform duration-500 group-hover:scale-105" />
          <MediaBadges post={post} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 pb-2 sm:py-2 sm:pr-3">
          {post.category && <CategoryPill category={post.category} className="self-start" />}
          <h3 className="font-heading text-lg leading-snug font-semibold text-foreground group-hover:text-primary md:text-xl">
            <Link href={href} className="after:absolute after:inset-0">
              {post.title}
            </Link>
          </h3>
          {post.excerpt && <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>}
          <PostMeta post={post} className="mt-1" />
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-video overflow-hidden bg-muted">
        <RemoteImage src={post.cover_image} alt="" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="transition-transform duration-500 group-hover:scale-105" />
        <MediaBadges post={post} />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4 md:p-5">
        {post.category && <CategoryPill category={post.category} className="self-start" />}
        <h3 className="font-heading line-clamp-2 text-lg leading-snug font-semibold text-foreground group-hover:text-primary">
          <Link href={href} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {post.excerpt && <p className="line-clamp-3 text-sm text-muted-foreground">{post.excerpt}</p>}
        <PostMeta post={post} className="mt-auto pt-2" />
      </div>
    </article>
  );
}

export function FeaturedPostCard({ post }: { post: BlogPost }) {
  return (
    <article className="group relative grid overflow-hidden rounded-3xl border bg-card md:grid-cols-[1.4fr_1fr]">
      <div className="relative aspect-video overflow-hidden bg-muted md:aspect-auto md:min-h-80">
        <RemoteImage src={post.cover_image} alt="" sizes="(max-width: 768px) 100vw, 60vw" priority className="transition-transform duration-700 group-hover:scale-105" />
        <MediaBadges post={post} />
      </div>
      <div className="flex flex-col justify-center gap-3 p-6 md:p-10">
        {post.category && <CategoryPill category={post.category} className="self-start" />}
        <h2 className="font-heading text-2xl leading-tight font-semibold text-foreground group-hover:text-primary md:text-3xl">
          <Link href={postHref(post.slug)} className="after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="line-clamp-4 text-[15px] text-muted-foreground">{post.excerpt}</p>}
        <div className="mt-2 flex items-center gap-3">
          {post.author && <span className="text-sm font-medium text-foreground">{post.author.name}</span>}
          <PostMeta post={post} />
        </div>
      </div>
    </article>
  );
}

export function PostCardSkeleton({ layout = "grid" }: { layout?: "grid" | "list" }) {
  return layout === "list" ? (
    <div className="flex flex-col gap-4 rounded-2xl border p-3 sm:flex-row sm:gap-6">
      <Skeleton className="aspect-video sm:w-72" />
      <div className="flex-1 space-y-3 py-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  ) : (
    <div className="overflow-hidden rounded-2xl border">
      <Skeleton className="aspect-video rounded-none" />
      <div className="space-y-3 p-5">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </div>
    </div>
  );
}
