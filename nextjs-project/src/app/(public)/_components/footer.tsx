import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";

/**
 * user footer
 * @returns
 *
 */
export default function Footer() {
     const date = new Date();
     const currentYear = date.getFullYear();

     return (
          <footer className=" divide-y bg-black/95 dark:bg-neutral-900/90 dark:border-y dark:border-neutral-800 text-gray-100 md:pb-0 pb-20">
               <div className="w-fit lg:container grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1  justify-items-stretch md:px-16 py-10 mx-auto space-y-8 lg:space-y-0 xl:gap-0 gap-x-16">
                    {/* footer logo section for table mod */}

                    <div className="hidden md:block mx-auto lg:hidden justify-center col-span-2 mb-4">
                         <FooterSiteLogo />
                    </div>

                    <div className="w-fit justify-self-center">
                         {/* site logo */}
                         <div className=" md:hidden lg:block mb-4">
                              <FooterSiteLogo />
                         </div>

                         {/* Social  */}
                         <div className="space-y-3 w-fit mx-auto mt-3 md:mt-0">
                              <div className="uppercase text-primary-foreground font-semibold">
                                   Social media
                              </div>
                              <div className="flex justify-start space-x-3">
                                   <Link
                                        rel="noopener noreferrer"
                                        href="https://www.facebook.com/mangrove.collection"
                                        target="_blank"
                                        title="Facebook"
                                        className="flex items-center p-1 hover:text-primary-foreground duration-150 relative group"
                                   >
                                        <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             fill="currentColor"
                                             viewBox="0 0 32 32"
                                             className="w-5 h-5 fill-current"
                                        >
                                             <path d="M32 16c0-8.839-7.167-16-16-16-8.839 0-16 7.161-16 16 0 7.984 5.849 14.604 13.5 15.803v-11.177h-4.063v-4.625h4.063v-3.527c0-4.009 2.385-6.223 6.041-6.223 1.751 0 3.584 0.312 3.584 0.312v3.937h-2.021c-1.984 0-2.604 1.235-2.604 2.5v3h4.437l-0.713 4.625h-3.724v11.177c7.645-1.199 13.5-7.819 13.5-15.803z"></path>
                                        </svg>
                                        <div className="absolute -bottom-16 right-[calc(100%-10px)] z-10 w-[400px] h-[500px] hidden opacity-0 group-hover:inline-block group-hover:opacity-100 transition-all duration-300">
                                             <iframe
                                                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fmangrove.collection&tabs=timeline&width=500&height=500&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId"
                                                  width="500"
                                                  height="500"
                                                  style={{
                                                       border: "none",
                                                       overflow: "hidden",
                                                  }}
                                                  scrolling="no"
                                                  frameBorder="0"
                                                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                                                  allowFullScreen
                                                  title="Mangrove Collection Facebook Page"
                                             />
                                        </div>
                                   </Link>
                                   <Link
                                        rel="noopener noreferrer"
                                        href="#"
                                        title="Twitter"
                                        className="flex items-center p-1 hover:text-primary-foreground duration-150"
                                   >
                                        <svg
                                             viewBox="0 0 24 24"
                                             xmlns="http://www.w3.org/2000/svg"
                                             className="w-5 h-5 fill-current"
                                        >
                                             <path d="M23.954 4.569a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.691 8.094 4.066 6.13 1.64 3.161a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.061a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.054 0 13.999-7.496 13.999-13.986 0-.209 0-.42-.015-.63a9.936 9.936 0 002.46-2.548l-.047-.02z"></path>
                                        </svg>
                                   </Link>
                                   <Link
                                        rel="noopener noreferrer"
                                        href="#"
                                        title="Instagram"
                                        className="flex items-center p-1 hover:text-primary-foreground duration-150"
                                   >
                                        <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             viewBox="0 0 32 32"
                                             fill="currentColor"
                                             className="w-5 h-5 fill-current"
                                        >
                                             <path d="M16 0c-4.349 0-4.891 0.021-6.593 0.093-1.709 0.084-2.865 0.349-3.885 0.745-1.052 0.412-1.948 0.959-2.833 1.849-0.891 0.885-1.443 1.781-1.849 2.833-0.396 1.020-0.661 2.176-0.745 3.885-0.077 1.703-0.093 2.244-0.093 6.593s0.021 4.891 0.093 6.593c0.084 1.704 0.349 2.865 0.745 3.885 0.412 1.052 0.959 1.948 1.849 2.833 0.885 0.891 1.781 1.443 2.833 1.849 1.020 0.391 2.181 0.661 3.885 0.745 1.703 0.077 2.244 0.093 6.593 0.093s4.891-0.021 6.593-0.093c1.704-0.084 2.865-0.355 3.885-0.745 1.052-0.412 1.948-0.959 2.833-1.849 0.891-0.885 1.443-1.776 1.849-2.833 0.391-1.020 0.661-2.181 0.745-3.885 0.077-1.703 0.093-2.244 0.093-6.593s-0.021-4.891-0.093-6.593c-0.084-1.704-0.355-2.871-0.745-3.885-0.412-1.052-0.959-1.948-1.849-2.833-0.885-0.891-1.776-1.443-2.833-1.849-1.020-0.396-2.181-0.661-3.885-0.745-1.703-0.077-2.244-0.093-6.593-0.093zM16 2.88c4.271 0 4.781 0.021 6.469 0.093 1.557 0.073 2.405 0.333 2.968 0.553 0.751 0.291 1.276 0.635 1.844 1.197 0.557 0.557 0.901 1.088 1.192 1.839 0.22 0.563 0.48 1.411 0.553 2.968 0.072 1.688 0.093 2.199 0.093 6.469s-0.021 4.781-0.099 6.469c-0.084 1.557-0.344 2.405-0.563 2.968-0.303 0.751-0.641 1.276-1.199 1.844-0.563 0.557-1.099 0.901-1.844 1.192-0.556 0.22-1.416 0.48-2.979 0.553-1.697 0.072-2.197 0.093-6.479 0.093s-4.781-0.021-6.48-0.099c-1.557-0.084-2.416-0.344-2.979-0.563-0.76-0.303-1.281-0.641-1.839-1.199-0.563-0.563-0.921-1.099-1.197-1.844-0.224-0.556-0.48-1.416-0.563-2.979-0.057-1.677-0.084-2.197-0.084-6.459 0-4.26 0.027-4.781 0.084-6.479 0.083-1.563 0.339-2.421 0.563-2.979 0.276-0.761 0.635-1.281 1.197-1.844 0.557-0.557 1.079-0.917 1.839-1.199 0.563-0.219 1.401-0.479 2.964-0.557 1.697-0.061 2.197-0.083 6.473-0.083zM16 7.787c-4.541 0-8.213 3.677-8.213 8.213 0 4.541 3.677 8.213 8.213 8.213 4.541 0 8.213-3.677 8.213-8.213 0-4.541-3.677-8.213-8.213-8.213zM16 21.333c-2.948 0-5.333-2.385-5.333-5.333s2.385-5.333 5.333-5.333c2.948 0 5.333 2.385 5.333 5.333s-2.385 5.333-5.333 5.333zM26.464 7.459c0 1.063-0.865 1.921-1.923 1.921-1.063 0-1.921-0.859-1.921-1.921 0-1.057 0.864-1.917 1.921-1.917s1.923 0.86 1.923 1.917z"></path>
                                        </svg>
                                   </Link>
                              </div>
                         </div>
                    </div>

                    {/* product section */}
                    <div className="space-y-3 w-fit  justify-self-center xl:text-left text-center">
                         <h3 className=" uppercase text-primary-foreground font-semibold">
                              Product
                         </h3>
                         <ul className="space-y-1">
                              {products.map((product, idx) => (
                                   <motion.li
                                        key={product.id}
                                        className="animate-delay-100 hover:text-primary-foreground duration-150"
                                        viewport={{ once: true, amount: 1 }}
                                        initial={{
                                             opacity: 0,
                                             y: 20,
                                        }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                             delay: 0.4 + idx * 0.1,
                                             duration: 0.4 + idx * 0.1,
                                        }}
                                   >
                                        <Link
                                             className="hover:translate-x-2 inline-block duration-500"
                                             rel="noopener noreferrer"
                                             href={product.href}
                                        >
                                             {product.label}
                                        </Link>
                                   </motion.li>
                              ))}
                         </ul>
                    </div>
                    <div className="space-y-3 w-fit  justify-self-center xl:text-left text-center ">
                         <h3 className=" uppercase text-primary-foreground font-semibold">
                              Company
                         </h3>

                         <ul className="space-y-1">
                              {allCompany.map((company, idx) => (
                                   <motion.li
                                        key={company.id}
                                        viewport={{ once: true, amount: 1 }}
                                        initial={{
                                             opacity: 0,
                                             y: 20,
                                        }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{
                                             delay: 0.4 + idx * 0.1,
                                             duration: 0.4 + idx * 0.1,
                                        }}
                                        className="animate-delay-100 hover:text-primary-foreground duration-150"
                                   >
                                        <Link
                                             className="hover:translate-x-2 inline-block duration-500"
                                             rel="noopener noreferrer"
                                             href={company.href}
                                        >
                                             {company.label}
                                        </Link>
                                   </motion.li>
                              ))}
                         </ul>
                    </div>
                    <div className="space-y-3 w-fit  justify-self-center xl:text-left text-center">
                         <h3 className="uppercase text-primary-foreground font-semibold">
                              Developers
                         </h3>
                         <ul className="space-y-1 ">
                              {developers.map((developer, idx) => (
                                   <motion.li
                                        key={developer.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{
                                             delay: 0.4 + idx * 0.1,
                                             duration: 0.4 + idx * 0.1,
                                        }}
                                        className="animate-delay-100 hover:text-primary-foreground duration-150"
                                   >
                                        <Link
                                             className="hover:translate-x-2 inline-block duration-500"
                                             rel="noopener noreferrer"
                                             href={developer.href}
                                        >
                                             {developer.label}
                                        </Link>
                                   </motion.li>
                              ))}
                         </ul>
                    </div>
               </div>
               <div className="py-6 text-sm text-center text-gray-400">
                    © {currentYear} Thanks From Mangrove Collection™ Ltd. | All
                    rights reserved.
               </div>
          </footer>
     );
}

function FooterSiteLogo() {
     return (
          <div
               className="flex lg:flex-col xl:flex-row justify-center gap-4 lg:gap-1 xl:gap-4 
        lg:mb-4 xl:mb-0 items-center pb-2 border-b xl:pb-0 xl:border-none "
          >
               <div className="flex justify-center items-center group gap-2">
                    <figure className=" w-10 h-10 mx-auto rounded-bl-3xl overflow-hidden ">
                         <Image
                              src="/assets/logo/mangrove-collection.png"
                              alt="Site logo"
                              className="w-full object-cover group-hover:scale-125 duration-300"
                              width={44}
                              height={44}
                         />
                    </figure>

                    <h2 className="flex-none font-bold text-primary-foreground text-sm md:text-base">
                         Mangrove <br /> Collection
                    </h2>
               </div>
          </div>
     );
}

const products = [
     { id: 1, href: "#", label: "Features" },
     { id: 2, href: "#", label: "Integrations" },
     { id: 3, href: "#", label: "Pricing" },
     { id: 4, href: "#", label: "FAQ" },
];
const allCompany = [
     { id: 1, href: "#", label: "Privacy" },
     { id: 2, href: "#", label: "Terms of Service" },
];
const developers = [
     { id: 1, href: "#", label: "Public API" },
     { id: 2, href: "#", label: "Documentation" },
     { id: 3, href: "#", label: "Guides" },
];
