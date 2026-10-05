export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.mangrove-collection.com/v1").replace(/\/$/, "");

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://mangrove-collection.com";

export const DASHBOARD_URL = (process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.mangrove-collection.com").replace(/\/$/, "");

/** Staff share the storefront's session cookie, so signed-in staff can open the dashboard directly. */
export const DASHBOARD_LOGIN_URL = `${DASHBOARD_URL}/login`;

export const NO_IMAGE = "/assets/no-image.jpg";
