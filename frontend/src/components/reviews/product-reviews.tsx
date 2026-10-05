"use client";

import { BadgeCheck, Camera, ChevronLeft, ChevronRight, MessageSquareText, Pencil, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { RemoteImage } from "@/components/shared/remote-image";
import { SimplePagination } from "@/components/shared/simple-pagination";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { type ReviewFilters, useProductReviews } from "@/lib/queries";
import { clearReviewSession, loadReviewSession, REVIEW_CONTACT_KEY, type ReviewSession, saveReviewSession } from "@/lib/reviews";
import type { Product, Review, ReviewImage, ReviewSummary } from "@/lib/types";
import { cn } from "@/lib/utils";

import { ReviewDialog } from "./review-dialog";
import { Stars } from "./stars";

const SORTS = [
  { value: "newest", label: "Newest" },
  { value: "highest", label: "Highest rated" },
  { value: "lowest", label: "Lowest rated" },
] as const;

function takeStoredContact(): string | undefined {
  try {
    const contact = sessionStorage.getItem(REVIEW_CONTACT_KEY) ?? undefined;
    sessionStorage.removeItem(REVIEW_CONTACT_KEY);
    return contact;
  } catch {
    return undefined;
  }
}

/** Verified-buyer reviews for one product. `autoOpen` starts the review flow (links from delivered orders). */
export function ProductReviews({ product, autoOpen = false }: { product: Product; autoOpen?: boolean }) {
  const [filters, setFilters] = useState<ReviewFilters>({ sort: "newest", page: 1 });
  const { data, isLoading } = useProductReviews(product.slug, filters);
  const [session, setSession] = useState<ReviewSession | null>(() => (typeof window === "undefined" ? null : loadReviewSession(product.slug)));
  const [dialog, setDialog] = useState(() => ({
    open: autoOpen,
    editing: false,
    nonce: 0,
    contact: autoOpen && typeof window !== "undefined" ? takeStoredContact() : undefined,
  }));
  const [lightbox, setLightbox] = useState<{ images: ReviewImage[]; index: number } | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (autoOpen) sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [autoOpen]);

  const updateSession = (next: ReviewSession | null) => {
    setSession(next);
    if (next) saveReviewSession(product.slug, next);
    else clearReviewSession(product.slug);
  };

  const openDialog = (editing = false) => setDialog((current) => ({ open: true, editing, nonce: current.nonce + 1, contact: undefined }));

  const ownReview = session?.check.status === "already_reviewed" ? session.check.review : null;
  const summary = data?.summary;
  const filtered = Boolean(filters.rating || filters.with_photos);
  const setFilter = (patch: Partial<ReviewFilters>) => setFilters((current) => ({ ...current, ...patch, page: 1 }));

  return (
    <section id="reviews" ref={sectionRef} className="mt-14 scroll-mt-28 rounded-3xl border bg-card p-5 md:mt-16 md:p-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="font-heading text-2xl font-semibold text-foreground">Customer reviews</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every review comes from a customer who received this product.</p>
        </div>
        <Button onClick={() => openDialog(Boolean(ownReview))} variant={ownReview ? "outline" : "default"}>
          {ownReview ? <Pencil className="size-4" /> : <Star className="size-4" />}
          {ownReview ? "Edit your review" : "Write a review"}
        </Button>
      </div>

      {isLoading || !summary ? (
        <div className="grid gap-8 md:grid-cols-[260px_1fr]">
          <Skeleton className="h-48" />
          <div className="space-y-4">
            <Skeleton className="h-28" />
            <Skeleton className="h-28" />
          </div>
        </div>
      ) : summary.count === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed px-6 py-12 text-center">
          <MessageSquareText className="size-10 text-muted-foreground/50" />
          <p className="font-medium text-foreground">No reviews yet</p>
          <p className="max-w-sm text-sm text-muted-foreground">Bought this product? Share your experience and help other shoppers decide.</p>
          <Button variant="outline" className="mt-2" onClick={() => openDialog()}>
            Be the first to review
          </Button>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-[260px_1fr] lg:gap-12">
          <RatingSummary summary={summary} activeRating={filters.rating} onRating={(rating) => setFilter({ rating: filters.rating === rating ? undefined : rating })} />

          <div className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <FilterChip active={!filtered} onClick={() => setFilter({ rating: undefined, with_photos: undefined })}>
                All ({summary.count})
              </FilterChip>
              {summary.with_photos > 0 && (
                <FilterChip active={Boolean(filters.with_photos)} onClick={() => setFilter({ with_photos: filters.with_photos ? undefined : true })}>
                  <Camera className="size-3.5" /> With photos ({summary.with_photos})
                </FilterChip>
              )}
              {filters.rating && (
                <FilterChip active onClick={() => setFilter({ rating: undefined })}>
                  {filters.rating} star · clear
                </FilterChip>
              )}
              <Select value={filters.sort} onValueChange={(sort) => setFilter({ sort: sort as ReviewFilters["sort"] })}>
                <SelectTrigger className="ml-auto h-9 w-40" aria-label="Sort reviews">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORTS.map((sort) => (
                    <SelectItem key={sort.value} value={sort.value}>
                      {sort.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {data.data.length === 0 ? (
              <p className="rounded-2xl border border-dashed px-6 py-10 text-center text-sm text-muted-foreground">No reviews match this filter.</p>
            ) : (
              <ul className="divide-y">
                {data.data.map((review) => (
                  <ReviewItem
                    key={review.id}
                    review={review}
                    own={review.id === ownReview?.id}
                    onEdit={() => openDialog(true)}
                    onManage={() => openDialog(false)}
                    onPhoto={(index) => setLightbox({ images: review.images, index })}
                  />
                ))}
              </ul>
            )}

            <SimplePagination page={data.meta.current_page} lastPage={data.meta.last_page} onChange={(page) => setFilters((current) => ({ ...current, page }))} />
          </div>
        </div>
      )}

      <ReviewDialog
        key={dialog.nonce}
        product={product}
        open={dialog.open}
        onOpenChange={(open) => setDialog((current) => ({ ...current, open }))}
        session={session}
        onSessionChange={updateSession}
        initialContact={dialog.contact}
        startEditing={dialog.editing}
      />

      <PhotoViewer viewer={lightbox} onChange={setLightbox} />
    </section>
  );
}

function RatingSummary({ summary, activeRating, onRating }: { summary: ReviewSummary; activeRating?: number; onRating: (rating: number) => void }) {
  return (
    <div className="space-y-4 md:sticky md:top-28 md:self-start">
      <div className="flex items-center gap-4">
        <span className="text-5xl font-semibold text-foreground">{summary.average.toFixed(1)}</span>
        <div className="space-y-1">
          <Stars value={summary.average} starClassName="size-5" />
          <p className="text-sm text-muted-foreground">
            {summary.count} review{summary.count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
      <ul className="space-y-1.5">
        {([5, 4, 3, 2, 1] as const).map((star) => {
          const total = summary.breakdown[String(star) as keyof ReviewSummary["breakdown"]] ?? 0;
          const percent = summary.count ? Math.round((total / summary.count) * 100) : 0;
          return (
            <li key={star}>
              <button
                type="button"
                onClick={() => onRating(star)}
                disabled={total === 0}
                aria-pressed={activeRating === star}
                aria-label={`Show ${star} star reviews (${total})`}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-1.5 py-1 text-xs transition-colors enabled:hover:bg-secondary disabled:cursor-default disabled:opacity-50",
                  activeRating === star && "bg-secondary",
                )}
              >
                <span className="flex w-7 items-center gap-0.5 font-medium text-foreground/80">
                  {star}
                  <Star className="size-3 text-gold" fill="currentColor" strokeWidth={0} />
                </span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <span className="block h-full rounded-full bg-gold" style={{ width: `${percent}%` }} />
                </span>
                <span className="w-8 text-right text-muted-foreground">{total}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function FilterChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-xs font-medium transition-colors",
        active ? "border-primary bg-primary text-white" : "border-input bg-card text-foreground/80 hover:border-primary hover:text-primary",
      )}
    >
      {children}
    </button>
  );
}

function ReviewItem({
  review,
  own,
  onEdit,
  onManage,
  onPhoto,
}: {
  review: Review;
  own: boolean;
  onEdit: () => void;
  onManage: () => void;
  onPhoto: (index: number) => void;
}) {
  return (
    <li className="space-y-2.5 py-5 first:pt-0">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <Stars value={review.rating} />
        <span className="text-sm font-medium text-foreground">{review.reviewer_name}</span>
        <span className="inline-flex items-center gap-1 text-xs font-medium text-primary">
          <BadgeCheck className="size-3.5" /> Verified purchase
        </span>
        {own && <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] font-semibold text-gold">Your review</span>}
        <span className="ml-auto text-xs text-muted-foreground">
          {formatDate(review.created_at)}
          {review.edited_at && " · edited"}
        </span>
      </div>
      <p className="text-sm leading-relaxed break-words whitespace-pre-line text-foreground/90">{review.comment}</p>
      {review.images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {review.images.map((image, index) => (
            <button
              key={image.path}
              type="button"
              onClick={() => onPhoto(index)}
              aria-label={`View photo ${index + 1} from ${review.reviewer_name}`}
              className="relative size-20 overflow-hidden rounded-lg border bg-muted transition-opacity hover:opacity-85 sm:size-24"
            >
              <RemoteImage src={image.url} alt="" sizes="96px" />
            </button>
          ))}
        </div>
      )}
      {own && (
        <div className="flex gap-2 pt-1">
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="size-3.5" /> Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={onManage}>
            <Trash2 className="size-3.5" /> Delete
          </Button>
        </div>
      )}
    </li>
  );
}

function PhotoViewer({
  viewer,
  onChange,
}: {
  viewer: { images: ReviewImage[]; index: number } | null;
  onChange: (viewer: { images: ReviewImage[]; index: number } | null) => void;
}) {
  const count = viewer?.images.length ?? 0;
  const go = (step: number) => viewer && onChange({ ...viewer, index: (viewer.index + step + count) % count });

  return (
    <Dialog open={Boolean(viewer)} onOpenChange={(open) => !open && onChange(null)}>
      <DialogContent
        className="max-w-[calc(100%-1rem)] bg-black p-2 sm:max-w-3xl [&>[data-slot=dialog-close]]:z-10 [&>[data-slot=dialog-close]]:bg-white/85"
        onKeyDown={(event) => {
          if (event.key === "ArrowRight") go(1);
          if (event.key === "ArrowLeft") go(-1);
        }}
      >
        <DialogTitle className="sr-only">Review photo</DialogTitle>
        {viewer && (
          <div className="relative aspect-square w-full overflow-hidden rounded-lg sm:aspect-[4/3]">
            <RemoteImage src={viewer.images[viewer.index]?.url} alt={`Review photo ${viewer.index + 1}`} sizes="(max-width: 768px) 100vw, 768px" className="object-contain" />
            {count > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => go(-1)}
                  aria-label="Previous photo"
                  className="absolute top-1/2 left-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground hover:bg-white"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <button
                  type="button"
                  onClick={() => go(1)}
                  aria-label="Next photo"
                  className="absolute top-1/2 right-2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-foreground hover:bg-white"
                >
                  <ChevronRight className="size-5" />
                </button>
                <span className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-2.5 py-0.5 text-xs text-white">
                  {viewer.index + 1} / {count}
                </span>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
