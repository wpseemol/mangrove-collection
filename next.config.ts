import type { NextConfig } from "next";

const nextConfig: NextConfig = {
     /* config options here */
     experimental: {
          serverActions: {
               bodySizeLimit: "5mb",
          },
     },
     images: {
          remotePatterns: [
               {
                    protocol: "https",
                    hostname: "firebasestorage.googleapis.com",
                    port: "",
               },
               {
                    protocol: "https",
                    hostname: "lh3.googleusercontent.com",
                    port: "",
               },
          ],
     },
};

export default nextConfig;
