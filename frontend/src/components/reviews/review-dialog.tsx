"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { EyeOff, Loader2, PackageSearch, Pencil, ShieldCheck, Trash2, Truck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { RemoteImage } from "@/components/shared/remote-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { api, ApiError, errorMessage } from "@/lib/api";
import { formatDate } from "@/lib/format";
import { isValidReviewContact, type ReviewSession, reviewSessionFrom } from "@/lib/reviews";
import type { Product, Review, ReviewCheck } from "@/lib/types";
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from "@/lib/validation";
import { useAuthStore } from "@/stores/auth";

import { ReviewForm } from "./review-form";
import { Stars } from "./stars";

const EXPIRED_MESSAGE = "Your check has expired. Please confirm your phone number or email again.";

/**
 * Verified-buyer review flow: one phone-or-email check, then write, edit or
 * delete. Mount with a fresh `key` each time it opens to reset its steps.
 */
export function ReviewDialog({
  product,
  open,
  onOpenChange,
  session,
  onSessionChange,
  initialContact,
  startEditing = false,
}: {
  product: Pick<Product, "slug" | "name" | "thumbnail">;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  session: ReviewSession | null;
  onSessionChange: (session: ReviewSession | null) => void;
  initialContact?: string;
  startEditing?: boolean;
}) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(startEditing);
  const check = session?.check ?? null;
  const ownReview = check?.status === "already_reviewed" ? check.review : null;

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["product", product.slug] });

  const updateCheck = (patch: Partial<ReviewCheck>) => {
    if (session) onSessionChange({ ...session, check: { ...session.check, ...patch } });
  };

  const expire = () => {
    onSessionChange(null);
    setEditing(false);
    toast.error(EXPIRED_MESSAGE);
  };

  const remove = useMutation({
    mutationFn: (review: Review) => api<void>(`/reviews/${review.id}`, { method: "DELETE", headers: { "X-Review-Token": session?.token ?? "" } }),
    onSuccess: () => {
      updateCheck({ status: "can_review", review: null });
      refresh();
      toast.success("Your review has been deleted.");
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) return expire();
      if (error instanceof ApiError && error.status === 404) {
        updateCheck({ status: "can_review", review: null });
        refresh();
        return toast.error("This review no longer exists.");
      }
      toast.error(errorMessage(error));
    },
  });

  const title = !session ? "Write a review" : ownReview ? (editing ? "Edit your review" : "Your review") : "Write a review";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{title}</DialogTitle>
          <DialogDescription className="flex items-center gap-3 pt-1">
            <span className="relative size-10 shrink-0 overflow-hidden rounded-lg border bg-muted">
              <RemoteImage src={product.thumbnail} alt="" sizes="40px" />
            </span>
            <span className="font-bangla line-clamp-2 text-foreground/80">{product.name}</span>
          </DialogDescription>
        </DialogHeader>

        {!session ? (
          <CheckStep slug={product.slug} initialContact={initialContact} onVerified={(next) => onSessionChange(next)} />
        ) : ownReview && !editing ? (
          <OwnReview
            review={ownReview}
            deleting={remove.isPending}
            onEdit={() => setEditing(true)}
            onDelete={() => remove.mutate(ownReview)}
          />
        ) : (
          <>
            {!ownReview && check?.reviewer_name && (
              <p className="flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-primary">
                <ShieldCheck className="size-4 shrink-0" />
                Verified buyer — your review will appear as “{check.reviewer_name}”.
              </p>
            )}
            <ReviewForm
              slug={product.slug}
              token={session.token}
              review={ownReview}
              onExpired={expire}
              onCancel={() => (ownReview ? setEditing(false) : onOpenChange(false))}
              onSaved={(saved) => {
                updateCheck({ status: "already_reviewed", review: saved });
                setEditing(false);
                refresh();
                toast.success(ownReview ? "Your review has been updated." : "Thanks! Your review is now live.");
                onOpenChange(false);
              }}
            />
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function CheckStep({ slug, initialContact, onVerified }: { slug: string; initialContact?: string; onVerified: (session: ReviewSession) => void }) {
  const user = useAuthStore((state) => state.user);
  const [contact, setContact] = useState(initialContact ?? "");
  const [error, setError] = useState<string>();
  const [result, setResult] = useState<ReviewCheck | null>(null);

  const verify = useMutation({
    mutationFn: (value: string | null) =>
      api<{ data: ReviewCheck }>(`/products/${slug}/reviews/verify`, { method: "POST", body: value ? { contact: value } : {} }).then((r) => r.data),
    onSuccess: (check) => {
      const session = reviewSessionFrom(check);
      if (check.eligible && session) onVerified(session);
      else setResult(check);
    },
    onError: (e) => {
      if (e instanceof ApiError && e.status === 429) return setError("Too many attempts. Please wait a minute and try again.");
      setError(e instanceof ApiError ? (e.field("contact") ?? e.message) : errorMessage(e));
    },
  });

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = contact.trim();
    setResult(null);

    if (!value) return setError("Enter the phone number or email you used when ordering.");
    if (isUnsafeText(value)) return setError(UNSAFE_TEXT_MESSAGE);
    if (!isValidReviewContact(value)) return setError("Enter a valid mobile number (e.g. 01712345678) or email address.");

    setError(undefined);
    verify.mutate(value);
  };

  const ResultIcon = result?.status === "not_delivered" ? Truck : PackageSearch;

  return (
    <div className="space-y-4">
      <p className="flex gap-2.5 text-sm text-muted-foreground">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
        Only customers who received this product can review it. Enter the phone number or email you used when ordering — no password or code
        needed.
      </p>

      {user && (
        <>
          <Button type="button" variant="outline" className="h-11 w-full" disabled={verify.isPending} onClick={() => verify.mutate(null)}>
            {verify.isPending && verify.variables === null && <Loader2 className="size-4 animate-spin" />}
            Continue as {user.name}
          </Button>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="h-px flex-1 bg-border" /> or use a phone number / email <span className="h-px flex-1 bg-border" />
          </div>
        </>
      )}

      <form onSubmit={submit} noValidate className="space-y-2">
        <label htmlFor="review-contact" className="text-sm font-medium text-foreground">
          Phone number or email
        </label>
        <div className="flex gap-2">
          <Input
            id="review-contact"
            value={contact}
            onChange={(event) => {
              setContact(event.target.value);
              if (error) setError(undefined);
            }}
            placeholder="01712345678 or you@example.com"
            autoComplete="on"
            maxLength={255}
            autoFocus={!user}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? "review-contact-error" : undefined}
            className="h-11"
          />
          <Button type="submit" className="h-11 px-5" disabled={verify.isPending}>
            {verify.isPending && verify.variables !== null && <Loader2 className="size-4 animate-spin" />}
            Check
          </Button>
        </div>
        {error && (
          <p id="review-contact-error" className="text-xs text-destructive">
            {error}
          </p>
        )}
      </form>

      {result && (
        <Alert>
          <ResultIcon className="size-4" />
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

function OwnReview({ review, deleting, onEdit, onDelete }: { review: Review; deleting: boolean; onEdit: () => void; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);

  return (
    <div className="space-y-4">
      {review.status === "hidden" && (
        <Alert>
          <EyeOff className="size-4" />
          <AlertDescription>Our team has hidden this review from the product page. You can edit or delete it.</AlertDescription>
        </Alert>
      )}

      <div className="space-y-3 rounded-xl border bg-surface/50 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Stars value={review.rating} />
          <span className="text-xs text-muted-foreground">
            {formatDate(review.created_at)}
            {review.edited_at && " · edited"}
          </span>
        </div>
        <p className="text-sm leading-relaxed whitespace-pre-line text-foreground/90">{review.comment}</p>
        {review.images.length > 0 && (
          <div className="grid grid-cols-4 gap-2">
            {review.images.map((image) => (
              <span key={image.path} className="relative aspect-square overflow-hidden rounded-lg border bg-muted">
                <RemoteImage src={image.url} alt="" sizes="96px" />
              </span>
            ))}
          </div>
        )}
      </div>

      {confirming ? (
        <div className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
          <p className="text-sm text-foreground">Delete your review? Its photos will be removed too. This can&apos;t be undone.</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setConfirming(false)} disabled={deleting}>
              Keep it
            </Button>
            <Button variant="destructive" size="sm" onClick={onDelete} disabled={deleting}>
              {deleting && <Loader2 className="size-4 animate-spin" />}
              Delete review
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" className="text-destructive hover:bg-destructive/10 hover:text-destructive" onClick={() => setConfirming(true)}>
            <Trash2 className="size-4" /> Delete
          </Button>
          <Button onClick={onEdit}>
            <Pencil className="size-4" /> Edit review
          </Button>
        </div>
      )}
    </div>
  );
}
