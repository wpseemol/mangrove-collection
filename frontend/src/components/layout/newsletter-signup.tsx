"use client";

import { CheckCircle2, Loader2, Mail, Send } from "lucide-react";
import { type FormEvent, useId, useState } from "react";

import { Container } from "@/components/shared/container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError, api } from "@/lib/api";
import { useHomeContent } from "@/lib/home-content";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Newsletter card that sits across the top edge of the footer on every page. */
export function NewsletterSignup() {
  const { content, ready } = useHomeContent();
  const block = content.newsletter;
  const id = useId();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");

  if (!ready || !block.enabled) return null;

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const value = email.trim();
    if (!EMAIL.test(value)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setStatus("sending");
    try {
      await api("/newsletter", { method: "POST", body: { email: value, source: "footer" } });
      setStatus("done");
      setEmail("");
    } catch (err) {
      setStatus("idle");
      setError(
        err instanceof ApiError
          ? (err.field("email") ?? (err.status === 429 ? "Too many attempts. Please try again in a minute." : err.message))
          : "Something went wrong. Please try again.",
      );
    }
  };

  return (
    <section aria-labelledby={`${id}-title`} className="relative z-10 bg-linear-to-b from-transparent from-50% to-forest to-50%">
      <Container>
        <div className="relative overflow-hidden rounded-3xl border bg-card px-6 py-8 shadow-2xl shadow-forest/15 sm:px-10 sm:py-10 lg:grid lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12 lg:px-14">
          <div className="pointer-events-none absolute -top-20 -left-16 size-56 rounded-full bg-brand/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-16 -bottom-24 size-64 rounded-full bg-gold/15 blur-3xl" />

          <div className="relative flex items-start gap-4">
            <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/25 sm:flex">
              <Mail className="size-5" />
            </span>
            <div>
              <h2 id={`${id}-title`} className="font-heading text-xl leading-tight font-semibold tracking-wide text-foreground uppercase sm:text-2xl">
                {block.title}
              </h2>
              {block.subtitle && <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">{block.subtitle}</p>}
            </div>
          </div>

          <div className="relative mt-6 lg:mt-0">
            {status === "done" ? (
              <p role="status" className="flex items-center gap-3 rounded-2xl border border-brand/30 bg-brand/10 px-5 py-4 text-sm font-medium text-foreground">
                <CheckCircle2 className="size-5 shrink-0 text-brand" />
                {block.success_message || "Thanks for subscribing!"}
              </p>
            ) : (
              <form onSubmit={submit} noValidate className="flex flex-col gap-3 sm:flex-row">
                <label htmlFor={`${id}-email`} className="sr-only">
                  Email address
                </label>
                <div className="relative flex-1">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={`${id}-email`}
                    type="email"
                    name="email"
                    autoComplete="email"
                    inputMode="email"
                    maxLength={255}
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError(null);
                    }}
                    placeholder={block.placeholder || "Enter your email address"}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={error ? `${id}-error` : block.note ? `${id}-note` : undefined}
                    className="h-12 rounded-full pl-11 text-[15px]"
                  />
                </div>
                <Button type="submit" size="lg" disabled={status === "sending"} className="h-12 rounded-full px-7">
                  {status === "sending" ? <Loader2 className="animate-spin" /> : <Send />}
                  {block.button_label || "Subscribe"}
                </Button>
              </form>
            )}
            {error && (
              <p id={`${id}-error`} role="alert" className="mt-2 pl-4 text-sm text-destructive">
                {error}
              </p>
            )}
            {status !== "done" && block.note && !error && (
              <p id={`${id}-note`} className="mt-2 pl-4 text-xs text-muted-foreground">
                {block.note}
              </p>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
