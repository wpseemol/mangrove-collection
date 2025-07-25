import { Card } from "@/components/ui/card";
import { getCategory } from "@/lib/actions/category";
import { Category } from "@/types/home";
import * as motion from "motion/react-client";
import Image from "next/image";
import Link from "next/link";
import HomeTitle from "./home-title";

export default async function CategorySection() {
     const categories = await getCategory();

     return (
          <section className="container mx-auto md:pb-10 pb-5 px-2 md:px-0">
               <HomeTitle>
                    <samp className="uppercase">Our Product Category</samp>
               </HomeTitle>
               <p className="text-muted-foreground text-center">
                    Get your desired product from a featured category
               </p>

               {categories.length > 0 && (
                    <motion.div
                         className="grid grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-x-2 gap-y-2 md:gap-y-5 mt-10"
                         initial={{ opacity: 0 }}
                         whileInView={{ opacity: 1 }}
                         viewport={{ once: true }}
                         transition={{ duration: 1, ease: "easeInOut" }}
                    >
                         {categories.map((category: Category) => (
                              <Card
                                   key={category.id}
                                   className="bg-card py-4 sm:px-2 px-1 group
                            hover:text-primary-foreground duration-300 rounded border-neutral-900/15 overflow-hidden 
                            md:h-[175px] h-[160px] w-full justify-self-center flex flex-col justify-center items-center 
                             hover:-translate-y-0.5"
                              >
                                   <Link
                                        href={`/products?category=${category?.slug}`}
                                   >
                                        <figure className="mx-auto md:w-24 md:h-24 sm:w-20 sm:h-20 w-10 h-12 overflow-hidden rounded">
                                             <Image
                                                  src={
                                                       category?.imgUrl ||
                                                       "/assets/logo/no-image.jpg"
                                                  }
                                                  alt={category?.name}
                                                  className="w-full h-full object-cover object-center group-hover:scale-105 duration-500"
                                                  width={70}
                                                  height={70}
                                             />
                                        </figure>
                                        <div>
                                             <h2 className="sm:text-base text-sm font-medium text-center mt-2 capitalize">
                                                  {category.name.toLocaleLowerCase()}
                                             </h2>
                                        </div>
                                   </Link>
                              </Card>
                         ))}
                    </motion.div>
               )}
          </section>
     );
}
