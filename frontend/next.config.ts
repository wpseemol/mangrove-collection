import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), usb=()" },
  // Allows the Google sign-in popup to report back to this window.
  { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  // Scripts are not restricted because admins can add analytics/pixel snippets from the dashboard.
  { key: "Content-Security-Policy", value: "frame-ancestors 'self'; base-uri 'self'; object-src 'none'; form-action 'self'; upgrade-insecure-requests" },
  ...(process.env.NODE_ENV === "production" ? [{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" }] : []),
];

const nextConfig: NextConfig = {
  // Runs as a Node server (`next start`) so blog pages are rendered on the server for search engines.
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    // Product and blog photos come straight from the API's storage, already resized on upload.
    unoptimized: true,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
