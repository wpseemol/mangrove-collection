import { Card } from '@/components/ui/card';
import { getCategory } from '@/db/mongoos-queries/get-category';
import { CategoryType } from '@/types/mongoose-models';
import Image from 'next/image';
import Link from 'next/link';
import HomeTitle from './home-title';

export default async function CategorySection() {
    const allCategory: CategoryType[] | null = await getCategory();

    return (
        <section className="container mx-auto pb-10">
            <HomeTitle>
                <samp className="uppercase">Our Product Category</samp>
            </HomeTitle>
            <p className="text-muted-foreground text-center">
                Get your desired product from a featured category
            </p>

            {allCategory && (
                <div
                    className={`${
                        allCategory.length <= 7
                            ? 'flex justify-center items-center flex-wrap'
                            : 'md:grid 2xl:grid-cols-8 xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 grid-cols-2 flex justify-center items-center flex-wrap'
                    } gap-x-3 gap-y-5 mt-5`}>
                    {allCategory.map((category) => {
                        return (
                            <Card
                                key={category?.id}
                                className=" bg-card  py-4 px-2 group
                             hover:text-primary-foreground duration-300 rounded overflow-hidden sm:w-[166px] h-[175px] w-[150px] justify-self-center flex flex-col justify-center items-center">
                                <Link
                                    href={`/products?category=${category?.slug}`}>
                                    <figure className="mx-auto sm:w-20 sm:h-20 w-16 h-16 overflow-hidden rounded">
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
