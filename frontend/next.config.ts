import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Exported as plain HTML/CSS/JS into out/ and served by Apache from public_html (no Node.js on the server).
  // Security headers, redirects and the 404 page live in public/.htaccess.
  output: "export",
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    // Product and blog photos come straight from the API's storage, already resized on upload.
    unoptimized: true,
  },
};

export default nextConfig;
