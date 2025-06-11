import { auth } from "@/auth";
import { notFound } from "next/navigation";

export default async function MainProfileLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const section = await auth();

     if (!section) {
          notFound();
          return;
     }

     return <>{children}</>;
}
