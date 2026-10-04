import type { MetadataRoute } from "next";

import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE_NAME,
    short_name: "Mangrove",
    description: SITE_DESCRIPTION,
    start_url: "/",
    display: "standalone",
    background_color: "#f6f5f0",
    theme_color: "#062b20",
    lang: "en",
    categories: ["shopping", "food"],
    icons: [{ src: "/assets/logo.png", sizes: "256x256", type: "image/png" }],
  };
}
