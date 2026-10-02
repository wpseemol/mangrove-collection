export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "https://api.mangrove-collection.com/v1").replace(/\/$/, "");

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://mangrove-collection.com";

export const DASHBOARD_URL = (process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "https://dashboard.mangrove-collection.com").replace(/\/$/, "");

/** Staff are signed into the dashboard with their storefront token, passed as a URL fragment. */
export const dashboardHandoffUrl = (token: string) => `${DASHBOARD_URL}/auth/handoff#token=${encodeURIComponent(token)}`;

export const NO_IMAGE = "/assets/no-image.jpg";
