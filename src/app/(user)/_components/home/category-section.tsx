import { Card } from '@/components/ui/card';
import { Category } from '@/types/home';
import Image from 'next/image';
import Link from 'next/link';
import HomeTitle from './home-title';

export default async function CategorySection() {
    let categories: Category[] | null = null;

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}api/v1/category`
        );

        if (response.ok) {
            const { data } = await response.json();
            categories = data;
        }
    } catch (error) {
        console.error('category fetch:', error);
    }

    return (
        <section className="container mx-auto md:pb-10 pb-5 px-2 md:px-0">
            <HomeTitle>
                <samp className="uppercase">Our Product Category</samp>
            </HomeTitle>
            <p className="text-muted-foreground text-center">
                Get your desired product from a featured category
            </p>

            {categories && (
                <div
                    className={`${
                        categories.length <= 7
                            ? 'md:flex justify-center items-center flex-wrap grid'
                            : 'grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-5 items-center'
                    } grid-cols-4 md:gap-2 gap-1 mt-5`}>
                    {categories.map((category: Category) => {
                        return (
                            <Card
                                key={category?.id}
                                className=" bg-card py-4 sm:px-2 px-1 group
                             hover:text-primary-foreground duration-300 rounded overflow-hidden md:h-[175px] h-[160px] w-full justify-self-center flex flex-col justify-center items-center shadow-none hover:shadow-[rgba(13,_38,_76,_0.19)_0px_9px_20px] ">
                                <Link
                                    href={`/products?category=${category?.slug}`}>
                                    <figure className="mx-auto md:w-24 md:h-24 sm:w-20 sm:h-20 w-10 h-12 overflow-hidden rounded ">
                                        <Image
                                            src={category?.imgUrl}
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
                        );
                    })}
                </div>
            )}
        </section>
    );
}
