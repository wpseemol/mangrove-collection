import ProductCard from '@/components/product-card';
import { getPopularProducts } from '@/server/products';
import HomeTitle from './home-title';

export default async function PopularProductSection() {
    const popularProducts = await getPopularProducts();

    return (
        <section className="container mx-auto md:pb-10 pb-5">
            <HomeTitle>
                <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
            </HomeTitle>
            {popularProducts && (
                <div
                    className={`mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3`}>
                    {popularProducts.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
