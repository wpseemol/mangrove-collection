import type { ReviewCheck } from "@/lib/types";

/** Mirrors backend-api/app/Http/Requests/ReviewRequest.php. */
export const REVIEW_RULES = {
  commentMin: 10,
  commentMax: 1000,
  maxImages: 4,
  maxImageBytes: 5 * 1024 * 1024,
  minImageSide: 200,
  maxImageSide: 4096,
  imageTypes: ["image/jpeg", "image/png", "image/webp"],
} as const;

/** sessionStorage key used by order pages to prefill the buyer check. */
export const REVIEW_CONTACT_KEY = "mc-review-contact";

/** Mirrors ReviewerIdentity::fromContact — a Bangladeshi mobile number in any common format, or an email. */
export function isValidReviewContact(value: string): boolean {
  const contact = value.trim();

  if (contact.includes("@")) {
    return contact.length <= 255 && /^[^\s@<>()[\]\\,;:"']+@[^\s@<>()[\]\\,;:"']+\.[a-z]{2,}$/i.test(contact);
  }

  if (!/^[\d\s\-()+]{10,20}$/.test(contact)) return false;

  let digits = contact.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("880")) digits = digits.slice(2);
  else if (digits.length === 10 && digits.startsWith("1")) digits = `0${digits}`;

  return /^01[3-9]\d{8}$/.test(digits);
}

/** Returns an error message, or null when the photo can be sent. */
export async function checkReviewImage(file: File): Promise<string | null> {
  if (!(REVIEW_RULES.imageTypes as readonly string[]).includes(file.type)) return `"${file.name}" is not a JPG, PNG or WebP photo.`;
  if (file.size > REVIEW_RULES.maxImageBytes) return `"${file.name}" is larger than 5 MB.`;

  const size = await imageSize(file).catch(() => null);
  if (!size) return `"${file.name}" could not be read as an image.`;

  const { minImageSide: min, maxImageSide: max } = REVIEW_RULES;
  if (size.width < min || size.height < min || size.width > max || size.height > max) {
    return `"${file.name}" must be between ${min} and ${max} pixels wide and tall.`;
  }

  return null;
}

function imageSize(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      reject(new Error("unreadable"));
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

/**
 * The buyer check result for one product, kept for this tab only so a refresh
 * doesn't ask for the phone number again. The token expires on the server too.
 */
export type ReviewSession = { token: string; expiresAt: number; check: ReviewCheck };

const sessionKey = (slug: string) => `mc-review:${slug}`;

export function loadReviewSession(slug: string): ReviewSession | null {
  try {
    const session = JSON.parse(sessionStorage.getItem(sessionKey(slug)) ?? "null") as ReviewSession | null;
    if (session?.token && session.expiresAt > Date.now()) return session;
  } catch {
    // Corrupt or unavailable storage: fall through and ask again.
  }
  clearReviewSession(slug);
  return null;
}

export function saveReviewSession(slug: string, session: ReviewSession): void {
  try {
    sessionStorage.setItem(sessionKey(slug), JSON.stringify(session));
  } catch {
    // Storage full or blocked: the session still works until the page is closed.
  }
}

export function clearReviewSession(slug: string): void {
  try {
    sessionStorage.removeItem(sessionKey(slug));
  } catch {
    // Ignore unavailable storage.
  }
}

export function reviewSessionFrom(check: ReviewCheck): ReviewSession | null {
  if (!check.token || !check.expires_in) return null;
  // Expire slightly early so a request never races the server-side expiry.
  return { token: check.token, expiresAt: Date.now() + (check.expires_in - 30) * 1000, check };
}
