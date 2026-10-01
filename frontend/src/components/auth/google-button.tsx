"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthRedirect } from "@/hooks/use-auth-redirect";
import { api, errorMessage } from "@/lib/api";
import { useSettings } from "@/lib/queries";
import type { AuthResponse } from "@/lib/types";

type TokenResponse = { access_token?: string; error?: string };
type TokenClient = { requestAccessToken: () => void };

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: TokenResponse) => void;
            error_callback?: (error: { type: string }) => void;
          }) => TokenClient;
        };
      };
    };
  }
}

let scriptPromise: Promise<void> | null = null;

function loadGoogleScript(): Promise<void> {
  scriptPromise ??= new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptPromise = null;
      reject(new Error("Could not load Google sign-in."));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.8-5.5 3.8-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.6 2.2 2.2 6.6 2.2 12s4.4 9.8 9.8 9.8c5.7 0 9.4-4 9.4-9.6 0-.6-.1-1.1-.2-1.6H12z" />
      <path fill="#34A853" d="M3.3 7.4l3.2 2.3C7.4 7.6 9.5 6 12 6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.2 2.2 4.9 4.3 3.3 7.4z" opacity=".9" />
      <path fill="#FBBC05" d="M12 21.8c2.5 0 4.7-.8 6.3-2.3l-2.9-2.4c-.8.6-1.9 1-3.4 1-3.9 0-5.3-2.6-5.5-3.8l-3.2 2.5c1.6 3.1 4.9 5 8.7 5z" opacity=".9" />
    </svg>
  );
}

export function GoogleButton({ label = "Continue with Google" }: { label?: string }) {
  const { data: settings } = useSettings();
  const { signIn } = useAuthRedirect();
  const [pending, setPending] = useState(false);

  if (!settings?.google_login_enabled || !settings.google_client_id) return null;

  const clientId = settings.google_client_id;

  const start = async () => {
    setPending(true);
    try {
      await loadGoogleScript();
      const client = window.google!.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "openid email profile",
        callback: async (response) => {
          if (!response.access_token) {
            setPending(false);
            return;
          }
          try {
            signIn(await api<AuthResponse>("/auth/google", { method: "POST", body: { access_token: response.access_token } }));
          } catch (e) {
            toast.error(errorMessage(e));
          } finally {
            setPending(false);
          }
        },
        error_callback: () => setPending(false),
      });
      client.requestAccessToken();
    } catch (e) {
      toast.error(errorMessage(e));
      setPending(false);
    }
  };

  return (
    <>
      <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
      </div>
      <Button type="button" variant="outline" className="h-10 w-full" onClick={start} disabled={pending}>
        {pending ? <Loader2 className="size-4 animate-spin" /> : <GoogleIcon />}
        {label}
      </Button>
    </>
  );
}
