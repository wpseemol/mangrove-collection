import { auth } from "@/auth";
import { userRoleCheck } from "@/lib/actions/user";
import { notFound } from "next/navigation";
import TabBtn from "./_components/tab-btn";

export default async function AddProductLayout({
     children,
}: {
     children: React.ReactNode;
}) {
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
               <header className="md:mb-4 mb-2 border-b dark:border-b-slate-50/20 mt-2">
                    <nav className="flex ml-4 items-center gap-2 border-b-0">
                         <TabBtn
                              href="/dashboard/add-product"
                              title="Add Product"
                         />
                         <TabBtn
                              href="/dashboard/add-product/add-category"
                              title="Add category"
                         />
                    </nav>
               </header>

               {children}
          </>
     );
}
