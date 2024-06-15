import HomeTitle from '@/app/Components/HomeTitle/HomeTitle';
import getCategory from '@/app/bd/mongoosQuery/getCategory';
import Image from 'next/image';
import Link from 'next/link';
import ForAnimate from '../Client/ForAnimate/ForAnimate';

export default async function Category() {
    const allCategory = await getCategory();

    return (
        <section className="container mx-auto mb-10">
            <ForAnimate tagName="div" animateClassName="animate-fade-right">
                <HomeTitle>
                    <samp className="uppercase">Our Product Category</samp>
                </HomeTitle>
            </ForAnimate>

            <div className="w-fit mx-auto grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-4 grid-cols-2 gap-2">
                {allCategory.map((category) => {
                    return (
                        <dir
                            key={category?.id}
                            className="flex flex-col items-center justify-center bg-[#f6f8fa] px-2 py-3
                            hover:text-primaryColor hover:scale-105 duration-300 rounded-md overflow-hidden">
                            <Link href={category?.categorySlug}>
                                <figure className="flex items-center justify-start w-full h-20">
                                    <Image
                                        src={category?.categoryImage}
                                        alt={category?.categoryName}
                                        className="w-20 mx-auto"
                                        width={100}
                                        height={100}
                                    />
                                </figure>
                                <div>
                                    <h2 className="text-base font-medium text-center mt-3">
                                        {category?.categoryName}
                                    </h2>
                                </div>
                            </Link>
                        </dir>
                    );
                })}
            </div>
        </section>
    );
}
