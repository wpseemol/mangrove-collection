import ProductCard from '@/components/product-card';
import { getNewArrivalProduct } from '@/server/products';
import HomeTitle from './home-title';

export default async function NewArrivalProduct() {
    const newArrivalProducts = await getNewArrivalProduct();

    return (
        <section className="container mx-auto pb-10">
            <HomeTitle>
                <samp className="uppercase">TOP NEW ARRIVAL</samp>
            </HomeTitle>
            {newArrivalProducts && (
                <div
                    className={`mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3`}>
                    {newArrivalProducts.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
