import ProductCard from '@/components/product-card';
import HomeTitle from './home-title';

export default function PopularProduct() {
    return (
        <section className="container mx-auto md:pb-10 pb-5">
            <HomeTitle>
                <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
            </HomeTitle>
            {products && (
                <div
                    className={` flex justify-center items-center flex-wrap sm:mt-5 mt-2 2xl:gap-x-5 gap-y-4  md:gap-x-4 gap-x-2`}>
                    {products.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
