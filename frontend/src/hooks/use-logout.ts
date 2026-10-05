"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { api } from "@/lib/api";
import { sessionQueryKey } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return async () => {
    await api("/auth/logout", { method: "POST" }).catch(() => undefined);
    useAuthStore.getState().clear();
    queryClient.setQueryData(sessionQueryKey, { authenticated: false, user: null });
    queryClient.removeQueries({ queryKey: ["my-orders"] });
    queryClient.removeQueries({ queryKey: ["my-order"] });
    queryClient.removeQueries({ queryKey: ["addresses"] });
    router.replace("/");
  };
}
