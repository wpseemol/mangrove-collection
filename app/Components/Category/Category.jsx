import goldaImgUrl from '@/public/assets/image/catagori-golda-chingre.png';
import bagdaImgUrl from '@/public/assets/image/catagory-badga-chingri.png';
import chingriImgUrl from '@/public/assets/image/catagory-chingre-mass.png';
import honeyImgUrl from '@/public/assets/image/category-honey-sundorbon.jpeg';
import telapiyaImgUrl from '@/public/assets/image/category-telapiya.png';
import Image from 'next/image';
import HomeTitle from '../HomeTitle/HomeTitle';

export default function Category() {
    const categoryData = [
        { slug: 'honey', name: 'Mangrove Honey', imgUrl: honeyImgUrl },
        { slug: 'bagda', name: 'Bagda Chingri', imgUrl: bagdaImgUrl },
        { slug: 'chingri', name: 'Chingri Mass', imgUrl: chingriImgUrl },
        { slug: 'golda', name: 'Golda Chingri', imgUrl: goldaImgUrl },
        { slug: 'telapiya', name: 'Telapiya Mass', imgUrl: telapiyaImgUrl },
        { slug: 'vatki', name: 'Vatki Mass', imgUrl: telapiyaImgUrl },
    ];

    return (
        <section className="container mx-auto mb-10">
            <HomeTitle>
                <samp className="uppercase">Our Product Category</samp>
            </HomeTitle>

            <div className="w-fit mx-auto grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-4 grid-cols-2 gap-2">
                {categoryData.map((category) => {
                    return (
                        <dir
                            key={category.slug}
                            className="flex flex-col items-center justify-center bg-[#f6f8fa] px-2 py-3
                            hover:text-primaryColor hover:scale-105 duration-300 rounded-md overflow-hidden">
                            <figure>
                                <Image
                                    src={category?.imgUrl}
                                    alt={category?.name}
                                    className="w-20"
                                    width={100}
                                    height={100}
                                />
                            </figure>
                            <div>
                                <h2 className="text-base font-medium mt-3">
                                    {category?.name}
                                </h2>
                            </div>
                        </dir>
                    );
                })}
            </div>
        </section>
    );
}
