import getCategory from '@/app/bd/mongoosQuery/getCategory';
import Image from 'next/image';
import AnimationLink from '../page-change-animation/animation-link';

export default async function CategoryMenus() {
    const allCategory = await getCategory();

    return (
        <ul className=" group-hover/category:md:h-fit group-hover/category:block md:block md:h-0 hidden md:absolute top-9 md:rounded-b rounded-r border-t-0 md:min-w-72 md:w-fit w-screen duration-150 overflow-hidden  origin-top text-lg text-nowrap md:shadow-lg mt-2 -ml-2 text-neutral-800 z-20 ">
            {allCategory?.map((category) => (
                <li
                    key={category?.id}
                    className="hover:text-primaryColor  px-2  md:border-b first:border-t w-full
                    group-hover/category:animate-flip-down group-hover/category:h-fit h-0 animate-duration-700 group/sub border-b-black border border-r-0 border-l-0 md:bg-white bg-gray-100 first:border-t-black duration-200 ">
                    <AnimationLink
                        href={`/products?category=${category?.categorySlug}`}
                        className="flex gap-1 items-center group-hover/sub:pl-2 py-2 duration-150 ml-8 md:ml-0 ">
                        <figure className="">
                            <Image
                                src={category?.categoryImage}
                                width={20}
                                height={20}
                                alt={category?.categoryName}
                                className="w-5 h-fit rounded"
                            />
                        </figure>
                        <p className="capitalize">
                            {category?.categoryName?.toLowerCase()}
                        </p>
                    </AnimationLink>
                </li>
            ))}
        </ul>
    );
}
