import { ThemeProvider } from "@/components/theme-provider";
import React from "react";
import CartProvider from "./cart-provider";

export default function PublicProviders({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     return (
          <>
               <CartProvider>
                    <ThemeProvider
                         attribute="class"
                         defaultTheme="light"
                         enableSystem
                         disableTransitionOnChange
                    >
                         {children}
                    </ThemeProvider>
               </CartProvider>
          </>
     );
}
