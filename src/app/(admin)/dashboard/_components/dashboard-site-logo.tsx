import Image from "next/image";
import Link from "next/link";

export default function DashboardSiteLogo({
     isDryerClose,
}: {
     isDryerClose: boolean;
}) {
     return (
          <section className={`flex gap-2 items-center group`}>
               <Link href="/">
                    <figure
                         className={`w-10 h-10 mx-auto overflow-hidden duration-300  ${
                              isDryerClose
                                   ? "rounded-full"
                                   : "sm:rounded-bl-3xl"
                         }`}
                    >
                         <Image
                              src="/assets/logo/mangrove-collection.png"
                              width={50}
                              height={50}
                              alt="Site logo"
                              className="w-full object-cover group-hover:scale-125 duration-300"
                         />
                    </figure>
               </Link>
               <Link href="/dashboard">
                    <h2
                         className={`font-bold text-primary-foreground text-sm md:text-base opacity-100
                        ${
                             isDryerClose
                                  ? "sm:hidden block sm:scale-0 sm:opacity-0 opacity-100 scale-200"
                                  : ""
                        }
                        `}
                    >
                         Mangrove Collection
                    </h2>
                    <p
                         className={`${
                              isDryerClose
                                   ? "sm:hidden block sm:scale-0 sm:opacity-0 opacity-100 scale-100"
                                   : ""
                         } text-primary-foreground text-sm font-thin opacity-200`}
                    >
                         Dashboard
                    </p>
               </Link>
          </section>
     );
}
