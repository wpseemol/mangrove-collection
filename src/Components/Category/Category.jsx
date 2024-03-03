import goldaImgUrl from '../../assets/image/catagori-golda-chingre.png';
import bagdaImgUrl from '../../assets/image/catagory-badga-chingri.png';
import chingriImgUrl from '../../assets/image/catagory-chingre-mass.png';
import honeyImgUrl from '../../assets/image/category-honey-sundorbon.jpeg';
import telapiyaImgUrl from '../../assets/image/category-telapiya.png';

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
            <div className="w-fit mx-auto grid xl:grid-cols-6 lg:grid-cols-5 md:grid-cols-4 sm:grid-cols-4 grid-cols-2 gap-2">
                {categoryData.map((category) => {
                    return (
                        <dir
                            key={category.slug}
                            className="flex flex-col items-center justify-center bg-[#f6f8fa] px-2 py-3
                            hover:text-primaryColor hover:scale-105 duration-300 rounded-md overflow-hidden">
                            <figure>
                                <img
                                    src={category?.imgUrl}
                                    alt={category?.name}
                                    className="w-20 "
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
