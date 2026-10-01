"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import type { AuthResponse } from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

/** Only same-site paths are honoured, so `?redirect=` cannot send users to another origin. */
export function safeRedirect(value: string | null, fallback = "/account"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function useAuthRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const setAuth = useAuthStore((s) => s.setAuth);
  const redirect = safeRedirect(params.get("redirect"));

  return {
    redirect,
    signIn(response: AuthResponse) {
      setAuth(response.token, response.user);
      queryClient.removeQueries({ queryKey: ["my-orders"] });
      queryClient.removeQueries({ queryKey: ["addresses"] });
      router.replace(redirect);
    },
  };
}
