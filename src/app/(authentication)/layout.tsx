import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function AuthenticationLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const session = await auth();

     if (session) {
          notFound();
          return;
     }

     return <>{children}</>;
}
