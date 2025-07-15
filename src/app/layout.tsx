import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import NextTopLoader from "nextjs-toploader";
import "./globals.css";

const poppins = Poppins({
     subsets: ["latin"],
     weight: ["400", "500", "600", "700"],
});
const roboto = Roboto({ subsets: ["latin"], weight: ["400", "500", "700"] });

export const metadata: Metadata = {
     title: "Mangrove Collection",
};
export default function RootLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <html lang="en" suppressHydrationWarning className="scroll-smooth">
               <body className={`${poppins.className} ${roboto.className}`}>
                    <NextTopLoader color="green" />
                    {children}
               </body>
          </html>
     );
}
