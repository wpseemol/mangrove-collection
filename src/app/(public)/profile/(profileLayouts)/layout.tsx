import { auth } from "@/auth";
import { notFound } from "next/navigation";
import ProfileLayouts from "../_components/profile-layouts";

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

     return <ProfileLayouts>{children}</ProfileLayouts>;
}
