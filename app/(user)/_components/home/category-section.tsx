import { Card } from '@/components/ui/card';
import { getCategory } from '@/db/mongoos-querys/get-category';
import { CategoryType } from '@/types/mongoose-models';
import Image from 'next/image';
import Link from 'next/link';
import HomeTitle from './home-title';

export default async function CategorySection() {
    const allCategory: CategoryType[] = await getCategory();

    return (
        <section className="container mx-auto pb-10">
            <HomeTitle>
                <samp className="uppercase">Our Product Category</samp>
            </HomeTitle>
            <p className="text-muted-foreground text-center">
                Get your desired product from a featured category
            </p>

            {allCategory.length > 0 && (
                <div className=" mx-auto grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-4 grid-cols-2 gap-x-3 gap-y-5 mt-5">
                    {allCategory.map((category) => {
                        return (
                            <Card
                                key={category?.id}
                                className=" bg-card  py-4 group
                             hover:text-primary-foreground duration-300 rounded overflow-hidden">
                                <Link
                                    href={`/products?category=${category?.slug}`}>
                                    <figure className="mx-auto w-20 h-20 overflow-hidden rounded">
                                        <Image
                                            src={category?.imgUrl}
                                            alt={category?.name}
                                            className="w-full h-full object-cover object-center group-hover:scale-105 duration-500"
                                            width={70}
                                            height={70}
                                        />
                                    </figure>
                                    <div>
                                        <h2 className="text-base font-medium text-center mt-2 capitalize">
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
