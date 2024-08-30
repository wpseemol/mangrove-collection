import ProductCard from '@/components/product-card';
import getProducts from '@/db/mongoos-queries/get-products';
import { ProductType } from '@/types/mongoose-models';
import HomeTitle from './home-title';

export default async function NewArrivalProduct() {
    const products: ProductType[] | null = await getProducts('new-arrival');

    return (
        <section className="container mx-auto pb-10">
            <HomeTitle>
                <samp className="uppercase">TOP NEW ARRIVAL</samp>
            </HomeTitle>
            {products && (
                <div
                    className={`${
                        products.length <= 5
                            ? 'flex justify-center items-center flex-wrap gap-5'
                            : 'md:grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 flex justify-center items-center flex-wrap 2xl:gap-x-3 gap-y-4  md:gap-x-0 gap-x-5'
                    }  mt-5`}>
                    {products.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </div>
            )}
        </section>
    );
}
