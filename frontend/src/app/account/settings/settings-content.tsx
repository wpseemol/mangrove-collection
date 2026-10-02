"use client";

import { useMutation } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";

import { PasswordInput } from "@/components/auth/password-input";
import { FormField } from "@/components/shared/form-field";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api, ApiError, errorMessage } from "@/lib/api";
import type { User } from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

function Card({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function ProfileForm({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const fileInput = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ name: user.name, email: user.email, phone: user.phone ?? "" });

  const save = useMutation({
    mutationFn: () => api<{ data: User }>("/account/profile", { method: "PATCH", body: { ...form, phone: form.phone || null } }).then((r) => r.data),
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Profile updated.");
    },
  });

  const upload = useMutation({
    mutationFn: (file: File) => {
      const body = new FormData();
      body.append("avatar", file);
      return api<{ data: User }>("/account/avatar", { method: "POST", body }).then((r) => r.data);
    },
    onSuccess: (updated) => {
      setUser(updated);
      toast.success("Photo updated.");
    },
    onError: (e) => toast.error(e instanceof ApiError ? (e.field("avatar") ?? e.message) : errorMessage(e)),
  });

  const error = save.error instanceof ApiError ? save.error : null;

  return (
    <Card title="Profile" description="Your name and contact details.">
      <div className="mb-5 flex items-center gap-4">
        <div className="relative">
          <Avatar className="size-16">
            <AvatarImage src={user.avatar ?? "/assets/user-avatar.png"} alt="" />
            <AvatarFallback>{user.name[0]}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            disabled={upload.isPending}
            aria-label="Change photo"
            className="absolute -right-1 -bottom-1 flex size-7 items-center justify-center rounded-full bg-primary text-white shadow"
          >
            {upload.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Camera className="size-3.5" />}
          </button>
          <input
            ref={fileInput}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) upload.mutate(file);
              e.target.value = "";
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground">JPG, PNG or WebP, up to 2 MB.</p>
      </div>

      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        <FormField id="name" label="Full name" error={error?.field("name")} className="sm:col-span-2">
          <Input id="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        </FormField>
        <FormField id="email" label="Email" error={error?.field("email")}>
          <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
        </FormField>
        <FormField id="phone" label="Phone" error={error?.field("phone")}>
          <Input id="phone" type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="01XXXXXXXXX" />
        </FormField>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Save changes
          </Button>
        </div>
      </form>
    </Card>
  );
}

function PasswordForm({ user }: { user: User }) {
  const setUser = useAuthStore((s) => s.setUser);
  const [form, setForm] = useState({ current_password: "", password: "", password_confirmation: "" });

  const save = useMutation({
    mutationFn: () => api<{ message: string }>("/account/password", { method: "PUT", body: form }),
    onSuccess: () => {
      setForm({ current_password: "", password: "", password_confirmation: "" });
      setUser({ ...user, has_password: true });
      toast.success("Password updated. Other devices have been logged out.");
    },
  });

  const error = save.error instanceof ApiError ? save.error : null;

  return (
    <Card
      title={user.has_password ? "Change password" : "Set a password"}
      description={user.has_password ? undefined : "You signed up with Google. Set a password to also log in with email or phone."}
    >
      <form
        className="grid gap-4 sm:grid-cols-2"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate();
        }}
      >
        {user.has_password && (
          <FormField id="current_password" label="Current password" error={error?.field("current_password")} className="sm:col-span-2">
            <PasswordInput id="current_password" value={form.current_password} onChange={(e) => setForm({ ...form, current_password: e.target.value })} autoComplete="current-password" required />
          </FormField>
        )}
        <FormField id="new_password" label="New password" error={error?.field("password")}>
          <PasswordInput id="new_password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" minLength={8} required />
        </FormField>
        <FormField id="new_password_confirmation" label="Confirm new password">
          <PasswordInput id="new_password_confirmation" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} autoComplete="new-password" required />
        </FormField>
        <div className="sm:col-span-2">
          <Button type="submit" disabled={save.isPending}>
            {save.isPending && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
        </div>
      </form>
    </Card>
  );
}

export function SettingsContent() {
  const user = useAuthStore((s) => s.user);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-3xl font-semibold text-gray-900">Account settings</h1>
      <ProfileForm key={`profile-${user.id}`} user={user} />
      <PasswordForm user={user} />
    </div>
  );
}
