import type { Metadata, Viewport } from "next";
import { Hind_Siliguri, Roboto } from "next/font/google";

import { FloatingSocial } from "@/components/layout/floating-social";
import { MainNav } from "@/components/layout/main-nav";
import { MobileBottomNav } from "@/components/layout/mobile-bottom-nav";
import { NewsletterSignup } from "@/components/layout/newsletter-signup";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteScripts } from "@/components/layout/site-scripts";
import { Providers } from "@/components/providers";
import { SITE_URL } from "@/lib/config";
import "./globals.css";

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const hind = Hind_Siliguri({
  variable: "--font-hind",
  subsets: ["bengali"],
  weight: ["400", "500", "600", "700"],
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

export const viewport: Viewport = {
  themeColor: "#062b20",
  viewportFit: "cover",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="bn" className={`${roboto.variable} ${hind.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
        <Providers>
          <SiteHeader />
          <MainNav />
          <main className="flex-1 pb-12 md:pb-20">{children}</main>
          <NewsletterSignup />
          <SiteFooter />
          <MobileBottomNav />
          <FloatingSocial />
          <SiteScripts />
        </Providers>
      </body>
    </html>
  );
}
