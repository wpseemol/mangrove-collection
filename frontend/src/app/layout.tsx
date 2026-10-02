import type { Metadata } from "next";
import { Fraunces, Hind_Siliguri, Inter, Noto_Serif_Bengali } from "next/font/google";

import { FloatingSocial } from "@/components/layout/floating-social";
import { MainNav } from "@/components/layout/main-nav";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteScripts } from "@/components/layout/site-scripts";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali"],
  weight: ["400", "500", "600"],
});

const banglaSerif = Noto_Serif_Bengali({
  variable: "--font-bangla-serif",
  subsets: ["bengali"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Mangrove Collection — From the heart of Sundarban",
    template: "%s | Mangrove Collection",
  },
  description:
    "Fresh fish, crab, prawn and pure honey collected directly from the Sundarbans and delivered to your door.",
  openGraph: {
    type: "website",
    siteName: "Mangrove Collection",
    images: ["/assets/og-image.jpg"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${inter.variable} ${fraunces.variable} ${hind.variable} ${banglaSerif.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-white">
        <Providers>
          <SiteHeader />
          <MainNav />
          <main className="flex-1 pb-20">{children}</main>
          <SiteFooter />
          <FloatingSocial />
          <SiteScripts />
        </Providers>
      </body>
    </html>
  );
}
