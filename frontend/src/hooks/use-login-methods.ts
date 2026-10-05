"use client";

import { useSettings } from "@/lib/queries";

/** Customer sign-in methods the admin has switched on in the dashboard. */
export function useLoginMethods() {
  const { data: settings } = useSettings();

  // Until settings load, assume the form is on so it doesn't flash away for the common case.
  const password = settings?.password_login_enabled ?? true;
  const google = Boolean(settings?.google_login_enabled && settings.google_client_id);

  return { ready: Boolean(settings), password, google, none: Boolean(settings) && !password && !google };
}
