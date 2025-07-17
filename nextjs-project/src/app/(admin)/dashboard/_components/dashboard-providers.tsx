import { auth } from "@/auth";
import { ThemeProvider } from "@/components/theme-provider";
import { SessionProvider } from "next-auth/react";

export default async function DashboardProviders({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const session = await auth();
     return (
          <>
               <SessionProvider session={session}>
                    <ThemeProvider
                         attribute="class"
                         defaultTheme="light"
                         enableSystem
                         disableTransitionOnChange
                    >
                         {children}
                    </ThemeProvider>
               </SessionProvider>
          </>
     );
}
