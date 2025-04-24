import ProductCard from "@/components/product-card";
import { getRelatedProducts } from "@/lib/server/products";

export default async function RelatedProduct(params: ParamsType) {
     const relatedProducts = await getRelatedProducts(
          params.skipId,
          params.categoryId
     );

     return (
          relatedProducts.length > 0 && (
               <section className="container md:pb-10 pb-5">
                    <h2 className="text-xl font-medium text-gray-800 dark:text-neutral-100 uppercase mb-6 md:text-start text-center">
                         Related products
                    </h2>
                    <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 md:gap-3 gap-2">
                         {relatedProducts.map((product) => (
                              <ProductCard
                                   key={product?.id}
                                   details={product}
                              />
                         ))}
                    </div>
               </section>
          )
     );
}

interface ParamsType {
     skipId: string;
     categoryId: string;
}
