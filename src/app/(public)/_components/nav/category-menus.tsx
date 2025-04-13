

import CustomLink from "@/components/custom-link";
import { getCategory } from "@/lib/server/get-category";
import Image from "next/image";




export default async function CategoryMenus() {
    

     const categories = await getCategory();

    if (categories.length <= 0) {
        return <></>;
    }

    return (
        <ul className="bg-white dark:bg-neutral-800 group-hover/category:md:h-fit md:block md:h-0 md:absolute top-9 md:rounded-b rounded-r border-t-0 md:min-w-72 md:w-fit w-screen duration-150 overflow-hidden origin-top text-lg text-nowrap md:shadow-lg mt-2 -ml-2 z-20 group-hover/category:animate-flip-down animate-duration-1000 ">
            {categories.map((category) => (
                <li
                    key={category?.id}
                    className="hover:text-primary-foreground  px-2  md:border-b-black/10 first:border-t-black/10 w-full 
                    group-hover/category:md:h-fit md:h-0 animate-duration-700 group/sub border-b-border border-black/10 border border-r-0 border-l-0 md:bg-secondary text-secondary-foreground duration-200 ">
                    <CustomLink
                        href={`/products?category=${category?.slug}`}
                        className="flex gap-1 items-center group-hover/sub:pl-2 py-2 duration-150 ml-8 md:ml-0 ">
                        <figure className="w-[20px] h-[20px] overflow-hidden rounded-sm">
                            <Image
                                src={category?.imgUrl}
                                width={20}
                                height={20}
                                alt={category.name}
                                className="w-full h-full object-cover object-center"
                            />
                        </figure>
                        <p className="capitalize">
                            {category.name.toLowerCase()}
                        </p>
                    </CustomLink>
                </li>
            ))}
        </ul>
    );
}
