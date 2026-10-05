"use client";

import { useMutation } from "@tanstack/react-query";
import { ImagePlus, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { FormField } from "@/components/shared/form-field";
import { RemoteImage } from "@/components/shared/remote-image";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, ApiError, errorMessage } from "@/lib/api";
import { checkReviewImage, REVIEW_RULES } from "@/lib/reviews";
import type { Review, ReviewImage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { isUnsafeText, UNSAFE_TEXT_MESSAGE } from "@/lib/validation";

import { StarInput } from "./stars";

type NewPhoto = { key: string; file: File; preview: string };
type Errors = Partial<Record<"rating" | "comment" | "images" | "form", string>>;

let photoKey = 0;

/** Writes a new review, or edits `review` when given. */
export function ReviewForm({
  slug,
  token,
  review,
  onSaved,
  onExpired,
  onCancel,
}: {
  slug: string;
  token: string;
  review: Review | null;
  onSaved: (review: Review) => void;
  onExpired: () => void;
  onCancel: () => void;
}) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [comment, setComment] = useState(review?.comment ?? "");
  const [kept, setKept] = useState<ReviewImage[]>(review?.images ?? []);
  const [photos, setPhotos] = useState<NewPhoto[]>([]);
  const [errors, setErrors] = useState<Errors>({});
  const [checkingPhotos, setCheckingPhotos] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const previews = useRef<string[]>([]);

  useEffect(() => () => previews.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const total = kept.length + photos.length;
  const length = comment.trim().length;

  async function addFiles(list: FileList | null) {
    const files = Array.from(list ?? []);
    if (fileInput.current) fileInput.current.value = "";
    if (!files.length) return;

    const room = REVIEW_RULES.maxImages - total;
    const problems: string[] = files.length > room ? [`You can add up to ${REVIEW_RULES.maxImages} photos.`] : [];
    const accepted: NewPhoto[] = [];

    setCheckingPhotos(true);
    for (const file of files.slice(0, Math.max(0, room))) {
      const problem = await checkReviewImage(file);
      if (problem) {
        problems.push(problem);
      } else {
        const preview = URL.createObjectURL(file);
        previews.current.push(preview);
        accepted.push({ key: `photo-${++photoKey}`, file, preview });
      }
    }
    setCheckingPhotos(false);

    setPhotos((current) => [...current, ...accepted]);
    setErrors((current) => ({ ...current, images: problems[0] }));
  }

  function removePhoto(photo: NewPhoto) {
    URL.revokeObjectURL(photo.preview);
    previews.current = previews.current.filter((url) => url !== photo.preview);
    setPhotos((current) => current.filter((p) => p.key !== photo.key));
  }

  function validate(): Errors {
    const next: Errors = {};
    const text = comment.trim();

    if (rating < 1 || rating > 5) next.rating = "Please choose a star rating.";
    if (text.length < REVIEW_RULES.commentMin) next.comment = `Please write at least ${REVIEW_RULES.commentMin} characters.`;
    else if (text.length > REVIEW_RULES.commentMax) next.comment = `Please keep your review under ${REVIEW_RULES.commentMax} characters.`;
    else if (isUnsafeText(text)) next.comment = UNSAFE_TEXT_MESSAGE;
    if (total > REVIEW_RULES.maxImages) next.images = `You can add up to ${REVIEW_RULES.maxImages} photos.`;

    return next;
  }

  const save = useMutation({
    mutationFn: () => {
      const body = new FormData();
      body.append("rating", String(rating));
      body.append("comment", comment.trim());
      photos.forEach((photo) => body.append("images[]", photo.file));

      if (review) {
        body.append("_method", "PUT");
        kept.forEach((image) => body.append("keep_images[]", image.path));
      }

      return api<{ data: Review }>(review ? `/reviews/${review.id}` : `/products/${slug}/reviews`, {
        method: "POST",
        body,
        headers: { "X-Review-Token": token },
      }).then((r) => r.data);
    },
    onSuccess: onSaved,
    onError: (error) => {
      if (error instanceof ApiError && error.status === 403) return onExpired();

      if (error instanceof ApiError && error.status === 422) {
        const imageError = Object.entries(error.errors).find(([key]) => key.startsWith("images") || key.startsWith("keep_images"))?.[1][0];
        const next: Errors = { rating: error.field("rating"), comment: error.field("comment"), images: imageError };
        next.form = error.field("review") ?? (next.rating || next.comment || next.images ? undefined : error.message);
        return setErrors(next);
      }

      setErrors({ form: errorMessage(error) });
    },
  });

  return (
    <form
      noValidate
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();
        const next = validate();
        setErrors(next);
        if (!Object.values(next).some(Boolean)) save.mutate();
      }}
    >
      <div className="space-y-1.5">
        <Label className="text-sm text-foreground">
          Your rating<span className="text-destructive">*</span>
        </Label>
        <StarInput
          value={rating}
          invalid={Boolean(errors.rating)}
          onChange={(value) => {
            setRating(value);
            setErrors((current) => ({ ...current, rating: undefined }));
          }}
        />
        {errors.rating && <p className="text-xs text-destructive">{errors.rating}</p>}
      </div>

      <FormField
        id="review-comment"
        label="Your review"
        required
        error={errors.comment}
        hint={
          <span className={cn("text-xs", length > REVIEW_RULES.commentMax ? "text-destructive" : "text-muted-foreground")}>
            {length}/{REVIEW_RULES.commentMax}
          </span>
        }
      >
        <Textarea
          id="review-comment"
          rows={5}
          maxLength={REVIEW_RULES.commentMax + 50}
          value={comment}
          onChange={(event) => {
            setComment(event.target.value);
            if (errors.comment) setErrors((current) => ({ ...current, comment: undefined }));
          }}
          placeholder="How was the quality, size, taste or packaging? Would you recommend it?"
          aria-invalid={Boolean(errors.comment)}
          aria-describedby={errors.comment ? "review-comment-error" : undefined}
          className="resize-y"
        />
      </FormField>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm text-foreground">
            Photos <span className="font-normal text-muted-foreground">(optional)</span>
          </Label>
          <span className="text-xs text-muted-foreground">
            {total}/{REVIEW_RULES.maxImages}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {kept.map((image, index) => (
            <PhotoTile key={image.path} label={`Remove photo ${index + 1}`} onRemove={() => setKept((current) => current.filter((i) => i.path !== image.path))}>
              <RemoteImage src={image.url} alt="" sizes="96px" />
            </PhotoTile>
          ))}
          {photos.map((photo, index) => (
            <PhotoTile key={photo.key} label={`Remove new photo ${index + 1}`} onRemove={() => removePhoto(photo)}>
              {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
              <img src={photo.preview} alt="" className="absolute inset-0 size-full object-cover" />
            </PhotoTile>
          ))}
          {total < REVIEW_RULES.maxImages && (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={checkingPhotos}
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-input text-xs text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-60"
            >
              {checkingPhotos ? <Loader2 className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
              Add photo
            </button>
          )}
        </div>
        <input
          ref={fileInput}
          type="file"
          accept={REVIEW_RULES.imageTypes.join(",")}
          multiple
          hidden
          onChange={(event) => addFiles(event.target.files)}
        />
        <p className={cn("text-xs", errors.images ? "text-destructive" : "text-muted-foreground")}>
          {errors.images ?? "JPG, PNG or WebP, up to 5 MB each."}
        </p>
      </div>

      {errors.form && (
        <Alert variant="destructive">
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel} disabled={save.isPending}>
          Cancel
        </Button>
        <Button type="submit" disabled={save.isPending || checkingPhotos}>
          {save.isPending && <Loader2 className="size-4 animate-spin" />}
          {review ? "Save changes" : "Post review"}
        </Button>
      </div>
    </form>
  );
}

function PhotoTile({ label, onRemove, children }: { label: string; onRemove: () => void; children: React.ReactNode }) {
  return (
    <div className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
      {children}
      <button
        type="button"
        onClick={onRemove}
        aria-label={label}
        className="absolute top-1 right-1 flex size-6 items-center justify-center rounded-full bg-black/70 text-white transition-colors hover:bg-destructive"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
