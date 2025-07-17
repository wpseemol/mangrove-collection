import { auth } from "@/auth";
import CustomLink from "@/components/custom-link";
import Image from "next/image";

import { FaRegUser } from "react-icons/fa6";

export default async function Account() {
     const session = await auth();
     const firstName = session?.user?.name?.split(" ")[0] || "Name";

     const picture = session?.user.image;

     let accountUrl = "/login";

     if (session?.user.role) {
          switch (session?.user.role) {
               case "user":
                    accountUrl = "/profile";
                    break;

               case "admin":
                    accountUrl = "/dashboard";
                    break;
               case "creator":
                    accountUrl = "/creator-dashboard";
                    break;
          }
     }

     if (session) {
          return (
               <li className="text-white group">
                    <CustomLink href={accountUrl}>
                         <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                              <div className="text-primary-foreground lg:text-3xl text-xl group-hover:scale-125 duration-200">
                                   <ProfilePicture
                                        url={picture}
                                        name={session.user.name}
                                   />
                              </div>
                              <div>
                                   <h2 className="sm:text-lg text-sm font-medium">
                                        {firstName}
                                   </h2>

                                   <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                        {session?.user.email}
                                   </p>
                              </div>
                         </div>
                    </CustomLink>
               </li>
          );
     }

     if (!session) {
          return (
               <>
                    <li className="text-white group">
                         <CustomLink href={"/login"}>
                              <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                                   <div className="text-primary-foreground lg:text-3xl text-xl group-hover:scale-125 duration-200">
                                        <FaRegUser />
                                   </div>
                                   <div>
                                        <h2 className="sm:text-lg text-sm font-medium">
                                             Account
                                        </h2>

                                        <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                             Register or Login
                                        </p>
                                   </div>
                              </div>
                         </CustomLink>
                    </li>
               </>
          );
     }
}

function ProfilePicture({ url, name }: { url?: string | null; name: string }) {
     if (url) {
          return (
               <figure className="w-[30px] h-[30px] rounded-full overflow-hidden">
                    <Image
                         src={url || "/assets/logo/no-image.jpg"}
                         alt={name}
                         width={30}
                         height={30}
                    />
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
