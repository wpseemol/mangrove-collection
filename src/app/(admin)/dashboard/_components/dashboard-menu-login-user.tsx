import { auth } from "@/auth";
import Image from "next/image";
import Link from "next/link";

export default async function DashboardLoginUser() {
     const session = await auth();

     return (
          <section className="mr-5">
               <div className="flex items-center gap-2 group">
                    <div className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                         <Link href="/dashboard/profile">
                              {session && (
                                   <ProfilePicture
                                        url={session?.user.image}
                                        name={session?.user.name}
                                   />
                              )}
                         </Link>
                    </div>
                    <div>
                         <Link href="/dashboard/profile">
                              <h2 className="text-sm group-hover:underline group-hover:underline-offset-2 group-hover:underline-primary duration-100 ">
                                   {session?.user.name}
                              </h2>
                              <p className="text-xs">{session?.user.role}</p>
                         </Link>
                    </div>
               </div>
          </section>
     );
}

function ProfilePicture({ url, name }: { url?: string | null; name: string }) {
     if (url) {
          return (
               <figure className="w-[30px] h-[30px] rounded-full overflow-hidden">
                    <Image src={url} alt={name} width={30} height={30} />
               </figure>
          );
     }

     const nameFirstLetter = name.split("")[0];

     return (
          <span className="w-[30px] h-[30px] font-bold ">
               {nameFirstLetter}
          </span>
     );
}
