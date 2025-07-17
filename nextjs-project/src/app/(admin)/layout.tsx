import { auth } from "@/auth";
import { userRoleCheck } from "@/lib/actions/user";
import { notFound } from "next/navigation";
import DashboardMenuLayout from "./dashboard/_components/dashboard-menu-layout";
import DashboardLoginUser from "./dashboard/_components/dashboard-menu-login-user";
import DashboardProviders from "./dashboard/_components/dashboard-providers";

export default async function AdminLayout({
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
          "admin"
     );

     if (!isAdmin) {
          notFound();
          return;
     }

     return (
          <>
               <DashboardProviders>
                    <DashboardMenuLayout userMenu={<DashboardLoginUser />}>
                         {children}
                    </DashboardMenuLayout>
               </DashboardProviders>
          </>
     );
}
