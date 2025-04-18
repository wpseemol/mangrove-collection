

import ProductCard from '@/components/product-card';
import HomeTitle from './home-title';
import { getPopularProducts } from '@/lib/server/get-populer-products';

export default async function PopularProductSection() {
    const popularProducts = await getPopularProducts();

    return (
        <section className="container mx-auto md:pb-10 pb-5 px-2 md:px-0">
            <HomeTitle>
                <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
            </HomeTitle>
            {(popularProducts.length > 0) && (
                <div
                    className={`mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-3 gap-2`}>
                    {popularProducts.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
