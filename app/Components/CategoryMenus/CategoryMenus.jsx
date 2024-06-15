import getCategory from '@/app/bd/mongoosQuery/getCategory';
import Image from 'next/image';
import Link from 'next/link';

export default async function CategoryMenus() {
    const allCategory = await getCategory();

    return (
        <ul
            className="hidden group-hover/category:block md:absolute top-9 md:rounded-b rounded-r md:border border-t-0 md:bg-white md:w-60 w-screen h-fit overflow-hidden  origin-top text-xl bg-gray-100
            md:shadow-lg mt-2 -ml-2 text-neutral-800 z-40 ">
            {allCategory?.map((category) => (
                <li
                    key={category?.id}
                    className="hover:text-primaryColor duration-150 px-2  md:border-b first:border-t w-full
                    group-hover/category:animate-flip-down animate-duration-700 group/sub border-b-black border border-r-0 border-l-0 first:border-t-black ">
                    <Link
                        href={`/products?category=${category?.categorySlug}`}
                        className="flex gap-1 items-center group-hover/sub:pl-2 py-2 duration-150 ml-8 md:ml-0 ">
                        <figure>
                            <Image
                                src={category?.categoryImage}
                                width={20}
                                height={20}
                                alt={category?.categoryName}
                                className="w-5 h-fit"
                            />
                        </figure>
                        {category?.categoryName}
                    </Link>
                </li>
            ))}
        </ul>
    );
}
