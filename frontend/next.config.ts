import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export: `next build` emits plain HTML/CSS/JS into `out/`.
  output: "export",
  // `/shop` -> `/shop/index.html`, so any static host serves it without rewrites.
  trailingSlash: true,
  images: {
    // The default image optimizer needs a Node server, which a static export doesn't have.
    unoptimized: true,
  },
};

export default nextConfig;
