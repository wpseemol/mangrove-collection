"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ApiError } from "@/lib/api";
import { useSession } from "@/lib/queries";
import { useAuthStore } from "@/stores/auth";

/** Reconciles the cached profile with the HttpOnly session cookie on load and on tab focus. */
function SessionSync() {
  const { isError } = useSession();

  useEffect(() => {
    // API unreachable: keep the cached profile; any protected request will 401 and clear it.
    if (!isError) return;
    const { user, status } = useAuthStore.getState();
    if (status === "unknown") useAuthStore.setState({ status: user ? "authenticated" : "guest" });
  }, [isError]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (failureCount, error) =>
              !(error instanceof ApiError && error.status < 500) && failureCount < 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SessionSync />
        {children}
        <Toaster position="top-center" richColors />
      </TooltipProvider>
    </QueryClientProvider>
  );
}
