import { auth } from "@/auth";
import { userRoleCheck } from "@/lib/actions/user";
import { notFound } from "next/navigation";

export default async function MainProfileLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const session = await auth();

     if (!session) {
          notFound();
          return;
     }

     const isUser = await userRoleCheck(
          session.user.id,
          session.user.role,
          "user"
     );

     if (isUser) {
          return <>{children}</>;
     }

     notFound();
     return;
}
