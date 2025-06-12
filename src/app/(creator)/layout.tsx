import { auth } from "@/auth";
import { userRoleCheck } from "@/lib/server/user";
import { notFound } from "next/navigation";

export default async function CreatorLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const session = await auth();

     if (!session) {
          notFound();
          return;
     }

     const isAdmin = await userRoleCheck(
          session.user.id,
          session.user.role,
          "creator"
     );

     if (!isAdmin) {
          notFound();
          return;
     }
     return <>{children}</>;
}
