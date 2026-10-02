"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";

import { DASHBOARD_URL } from "@/lib/config";
import { sessionQueryKey } from "@/lib/queries";
import { type AuthResponse, isStaff } from "@/lib/types";
import { useAuthStore } from "@/stores/auth";

/** Only same-site paths are honoured, so `?redirect=` cannot send users to another origin. */
export function safeRedirect(value: string | null, fallback = "/account"): string {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : fallback;
}

export function useAuthRedirect() {
  const router = useRouter();
  const params = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((s) => s.setUser);
  const redirect = safeRedirect(params.get("redirect"));

  return {
    redirect,
    signIn({ user }: AuthResponse) {
      setUser(user);
      queryClient.setQueryData(sessionQueryKey, { authenticated: true, user });
      queryClient.removeQueries({ queryKey: ["my-orders"] });
      queryClient.removeQueries({ queryKey: ["addresses"] });

      // The dashboard shares this session cookie, so staff land there already signed in.
      if (isStaff(user)) {
        window.location.assign(DASHBOARD_URL);
        return;
      }

      router.replace(redirect);
    },
  };
}
