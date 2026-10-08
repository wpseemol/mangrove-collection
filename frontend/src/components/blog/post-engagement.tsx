"use client";

import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Heart, Link2, Loader2, LogIn, MessageCircle, Send, Share2, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { FacebookIcon, WhatsAppIcon } from "@/components/layout/social-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, api, errorMessage } from "@/lib/api";
import { postHref } from "@/lib/blog";
import { useSession } from "@/lib/queries";
import { absoluteUrl } from "@/lib/seo";
import type { BlogComment, BlogEngagement, Paginated } from "@/lib/types";
import { cn } from "@/lib/utils";

const engagementKey = (slug: string) => ["blog-engagement", slug] as const;
const commentsKey = (slug: string) => ["blog-comments", slug] as const;
const path = (slug: string) => `/blog/posts/${encodeURIComponent(slug)}`;

function useSignedIn() {
  const { data, isPending } = useSession();
  return { signedIn: Boolean(data?.user), checking: isPending };
}

function useLoginHref() {
  const pathname = usePathname();
  return `/login/?redirect=${encodeURIComponent(pathname)}`;
}

function useEngagement(slug: string) {
  return useQuery({ queryKey: engagementKey(slug), queryFn: () => api<BlogEngagement>(`${path(slug)}/engagement`), staleTime: 60_000 });
}

/** Counts the visit once per browser session; the server-rendered page is cached and can't. */
function useRecordView(slug: string) {
  useEffect(() => {
    const key = `mc-viewed:${slug}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      return;
    }
    api(`${path(slug)}/view`, { method: "POST" }).catch(() => undefined);
  }, [slug]);
}

function LikeButton({ slug, size = "default" }: { slug: string; size?: "default" | "lg" }) {
  const queryClient = useQueryClient();
  const { signedIn } = useSignedIn();
  const loginHref = useLoginHref();
  const { data } = useEngagement(slug);
  const liked = Boolean(data?.liked);

  const toggle = useMutation({
    mutationFn: () => api<{ liked: boolean; likes_count: number }>(`${path(slug)}/like`, { method: liked ? "DELETE" : "POST" }),
    onMutate: () => {
      queryClient.setQueryData<BlogEngagement>(engagementKey(slug), (current) =>
        current ? { ...current, liked: !liked, likes_count: Math.max(0, current.likes_count + (liked ? -1 : 1)) } : current,
      );
    },
    onSuccess: (result) => queryClient.setQueryData<BlogEngagement>(engagementKey(slug), (current) => (current ? { ...current, ...result } : current)),
    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: engagementKey(slug) });
      toast.error(errorMessage(error));
    },
  });

  const content = (
    <>
      <Heart className={cn("transition-transform", liked && "scale-110 fill-current")} />
      <span className="tabular-nums">{data?.likes_count ?? 0}</span>
      <span className="sr-only">{liked ? "Unlike this article" : "Like this article"}</span>
    </>
  );
  const className = cn("rounded-full", liked && "border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-700", size === "lg" && "h-11 px-5");

  if (!signedIn) {
    return (
      <Button asChild variant="outline" className={className} title="Sign in to like">
        <Link href={loginHref}>{content}</Link>
      </Button>
    );
  }
  return (
    <Button variant="outline" className={className} aria-pressed={liked} disabled={toggle.isPending} onClick={() => toggle.mutate()}>
      {content}
    </Button>
  );
}

function ShareButtons({ slug, title }: { slug: string; title: string }) {
  const { signedIn } = useSignedIn();
  const loginHref = useLoginHref();
  const [copied, setCopied] = useState(false);
  const url = absoluteUrl(postHref(slug));
  const encoded = encodeURIComponent(url);

  if (!signedIn) {
    return (
      <Button asChild variant="outline" className="rounded-full" title="Sign in to share">
        <Link href={loginHref}>
          <Share2 /> Share
        </Link>
      </Button>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy the link.");
    }
  };

  const nativeShare = typeof navigator !== "undefined" && "share" in navigator;

  return (
    <div className="flex items-center gap-1.5">
      {nativeShare && (
        <Button variant="outline" size="icon" className="rounded-full sm:hidden" aria-label="Share" onClick={() => navigator.share({ title, url }).catch(() => undefined)}>
          <Share2 />
        </Button>
      )}
      <Button asChild variant="outline" size="icon" className="rounded-full">
        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encoded}`} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">
          <FacebookIcon className="size-4" />
        </a>
      </Button>
      <Button asChild variant="outline" size="icon" className="rounded-full">
        <a href={`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp">
          <WhatsAppIcon className="size-4" />
        </a>
      </Button>
      <Button variant="outline" size="icon" className="rounded-full" onClick={copy} aria-label={copied ? "Link copied" : "Copy link"}>
        {copied ? <Check className="text-primary" /> : <Link2 />}
      </Button>
    </div>
  );
}

/** Like, comment count and share, shown under the title and again after the article. */
export function PostActions({ slug, title, track = false }: { slug: string; title: string; track?: boolean }) {
  const { data } = useEngagement(slug);
  return (
    <div className="flex flex-wrap items-center gap-2">
      {track && <ViewTracker slug={slug} />}
      <LikeButton slug={slug} />
      <Button asChild variant="outline" className="rounded-full">
        <a href="#comments">
          <MessageCircle /> <span className="tabular-nums">{data?.comments_count ?? 0}</span>
          <span className="sr-only">comments</span>
        </a>
      </Button>
      <ShareButtons slug={slug} title={title} />
    </div>
  );
}

function ViewTracker({ slug }: { slug: string }) {
  useRecordView(slug);
  return null;
}

const timeAgo = (value: string) => {
  const seconds = Math.max(1, Math.round((Date.now() - new Date(value).getTime()) / 1000));
  const steps: [number, string][] = [
    [31_536_000, "y"],
    [2_592_000, "mo"],
    [604_800, "w"],
    [86_400, "d"],
    [3_600, "h"],
    [60, "m"],
  ];
  for (const [size, unit] of steps) if (seconds >= size) return `${Math.floor(seconds / size)}${unit} ago`;
  return "just now";
};

function CommentForm({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = useMutation({
    mutationFn: () => api<{ data: BlogComment }>(`${path(slug)}/comments`, { method: "POST", body: { body: body.trim() } }),
    onSuccess: () => {
      setBody("");
      setError(null);
      toast.success("Thanks! Your comment is posted.");
      queryClient.invalidateQueries({ queryKey: commentsKey(slug) });
      queryClient.invalidateQueries({ queryKey: engagementKey(slug) });
    },
    onError: (e) => setError(e instanceof ApiError ? (e.field("body") ?? e.message) : errorMessage(e)),
  });

  return (
    <form
      className="rounded-2xl border bg-card p-4"
      onSubmit={(event) => {
        event.preventDefault();
        if (body.trim().length < 2) return setError("Write at least 2 characters.");
        submit.mutate();
      }}
    >
      <label htmlFor="comment-body" className="sr-only">
        Your comment
      </label>
      <Textarea
        id="comment-body"
        value={body}
        onChange={(e) => {
          setBody(e.target.value);
          if (error) setError(null);
        }}
        maxLength={2000}
        rows={3}
        placeholder="Share a tip, a question or how your recipe turned out…"
        aria-invalid={Boolean(error)}
        className="resize-y border-0 bg-transparent p-0 shadow-none focus-visible:ring-0"
      />
      <div className="mt-3 flex items-center justify-between gap-3 border-t pt-3">
        <p className={cn("text-xs", error ? "text-destructive" : "text-muted-foreground")}>{error ?? `${body.length}/2000 · Be kind; links and HTML are not allowed.`}</p>
        <Button type="submit" size="sm" className="rounded-full" disabled={submit.isPending}>
          {submit.isPending ? <Loader2 className="animate-spin" /> : <Send />} Post
        </Button>
      </div>
    </form>
  );
}

export function PostComments({ slug }: { slug: string }) {
  const queryClient = useQueryClient();
  const { signedIn, checking } = useSignedIn();
  const loginHref = useLoginHref();
  const { data: engagement } = useEngagement(slug);

  const comments = useInfiniteQuery({
    queryKey: commentsKey(slug),
    initialPageParam: 1,
    queryFn: ({ pageParam }) => api<Paginated<BlogComment>>(`${path(slug)}/comments`, { query: { page: pageParam, per_page: 10 } }),
    getNextPageParam: (last) => (last.meta.current_page < last.meta.last_page ? last.meta.current_page + 1 : undefined),
  });

  const remove = useMutation({
    mutationFn: (comment: BlogComment) => api(`/blog/comments/${comment.id}`, { method: "DELETE" }),
    onSuccess: () => {
      toast.success("Comment deleted.");
      queryClient.invalidateQueries({ queryKey: commentsKey(slug) });
      queryClient.invalidateQueries({ queryKey: engagementKey(slug) });
    },
    onError: (e) => toast.error(errorMessage(e)),
  });

  const list = comments.data?.pages.flatMap((page) => page.data) ?? [];
  const count = engagement?.comments_count ?? comments.data?.pages[0]?.meta.total ?? 0;

  return (
    <section id="comments" aria-labelledby="comments-title" className="scroll-mt-24">
      <h2 id="comments-title" className="font-heading mb-5 flex items-center gap-2 text-2xl font-semibold text-foreground">
        <MessageCircle className="size-6 text-primary" /> Comments {count > 0 && <span className="text-base font-normal text-muted-foreground">({count})</span>}
      </h2>

      {checking ? null : signedIn ? (
        <CommentForm slug={slug} />
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-dashed bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Sign in to like, comment on and share this article.</p>
          <Button asChild className="rounded-full">
            <Link href={loginHref}>
              <LogIn /> Sign in
            </Link>
          </Button>
        </div>
      )}

      <ul className="mt-6 space-y-5">
        {comments.isPending
          ? Array.from({ length: 2 }, (_, index) => <li key={index} className="h-16 animate-pulse rounded-xl bg-muted" />)
          : list.map((comment) => (
              <li key={comment.id} className="flex gap-3">
                <Avatar className="size-10">
                  <AvatarImage src={comment.author?.avatar ?? undefined} alt="" />
                  <AvatarFallback className="bg-secondary text-sm text-primary">{comment.author?.name?.[0]?.toUpperCase() ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl rounded-tl-sm bg-muted/60 px-4 py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-semibold text-foreground">{comment.author?.name ?? "Customer"}</span>
                      <time dateTime={comment.created_at} className="text-xs text-muted-foreground">
                        {timeAgo(comment.created_at)}
                      </time>
                    </div>
                    <p className="mt-1 text-[15px] break-words whitespace-pre-line text-foreground/90">{comment.body}</p>
                  </div>
                  {comment.is_mine && (
                    <button
                      type="button"
                      onClick={() => remove.mutate(comment)}
                      disabled={remove.isPending}
                      className="mt-1 ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3" /> Delete
                    </button>
                  )}
                </div>
              </li>
            ))}
      </ul>

      {!comments.isPending && list.length === 0 && <p className="mt-2 text-sm text-muted-foreground">No comments yet. Be the first to share your thoughts.</p>}

      {comments.hasNextPage && (
        <Button variant="outline" className="mt-6 rounded-full" onClick={() => comments.fetchNextPage()} disabled={comments.isFetchingNextPage}>
          {comments.isFetchingNextPage && <Loader2 className="animate-spin" />} Show more comments
        </Button>
      )}
    </section>
  );
}

export function LikeCallout({ slug }: { slug: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-3xl bg-secondary/60 px-6 py-8 text-center">
      <p className="font-heading text-xl font-semibold text-foreground">Found this helpful?</p>
      <LikeButton slug={slug} size="lg" />
    </div>
  );
}
