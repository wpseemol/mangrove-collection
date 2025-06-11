import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ProfileLayouts from "../_components/profile-layouts";
import ProfileSubMenu from "../_components/profile-sub-menu";

export default async function ProfileSubLayout({
     children,
}: Readonly<{
     children: React.ReactNode;
}>) {
     const session = await auth();

     if (!session) {
          notFound();
          return;
     }

     return (
          <ProfileLayouts>
               <ProfileSubMenu />
               {children}
          </ProfileLayouts>
     );
}
