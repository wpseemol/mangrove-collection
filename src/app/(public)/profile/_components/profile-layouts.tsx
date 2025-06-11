import { auth } from "@/auth";
import Image from "next/image";
import { notFound } from "next/navigation";
import ProfileBreadcrumb from "./profile-breadcrumb";

export default async function ProfileLayouts({
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
          <main className="container mx-auto md:min-h-[calc(100vh-25rem)]">
               {/* breadcrumb Product page*/}
               <ProfileBreadcrumb />

               <section className="flex md:flex-row flex-col items-center justify-center md:justify-between 2xl:max-w-7xl lg:max-w-6xl md:max-w-5xl mx-auto my-6 md:gap-0 gap-6">
                    <div className="flex items-center gap-4">
                         <figure className="border border-gray-200 rounded-full overflow-hidden">
                              <Image
                                   src={session.user.image}
                                   alt={session.user.name}
                                   width={80}
                                   height={80}
                              />
                         </figure>
                         <div className="space-y-1">
                              <p className="text-gray-600 sm:text-sm text-xs">
                                   Hello,
                              </p>
                              <h4 className="sm:text-xl text-md font-medium text-neutral-600 dark:text-white">
                                   {session.user.name}
                              </h4>
                         </div>
                    </div>
                    <div className="flex items-center">
                         <div className="border-none md:border-l border-gray-300 text-center px-4  space-y-2 sm:py-2 py-1">
                              <h3 className="text-gray-600 sm:text-xl text-md font-medium">
                                   Total Products
                              </h3>
                              <p className="text-2xl font-semibold text-primary-foreground">
                                   0
                              </p>
                         </div>
                         <div className="border-l border-gray-300 text-center px-4 space-y-2 sm:py-2 py-1">
                              <h3 className="text-gray-600 sm:text-xl text-md font-medium">
                                   Store Credit
                              </h3>
                              <p className="text-2xl font-semibold text-primary-foreground">
                                   0
                              </p>
                         </div>
                    </div>
               </section>
               <section className="2xl:max-w-7xl lg:max-w-6xl md:max-w-5xl mx-auto my-6">
                    {children}
               </section>
          </main>
     );
}
