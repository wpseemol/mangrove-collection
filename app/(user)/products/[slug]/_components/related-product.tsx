import ProductCard from '@/components/product-card';
import getProducts from '@/db/mongoos-queries/get-products';
import { ProductType } from '@/types/mongoose-models';

export default async function RelatedProduct({
    excludeProductId,
    categoryId,
}: {
    excludeProductId: string;
    categoryId: string;
}) {
    const relatedProducts: ProductType[] | null = await getProducts(
        'related-product',
        [categoryId],
        null,
        null,
        excludeProductId
    );

    return (
        relatedProducts &&
        relatedProducts.length > 0 && (
            <section className="container md:pb-10 pb-5">
                <h2 className="text-2xl font-medium text-gray-800 dark:text-neutral-100 uppercase mb-6">
                    Related products
                </h2>
                <div className="flex items-center flex-wrap gap-6">
                    {relatedProducts?.map((product) => (
                        <ProductCard key={product?.id} details={product} />
                    ))}
                </div>
            </section>
        )
    );
}
