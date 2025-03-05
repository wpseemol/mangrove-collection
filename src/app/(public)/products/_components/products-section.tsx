import ProductCard from '@/components/product-card';
import { getCategoryMongoId } from '@/server/category';
import { getProducts } from '@/server/products';
import { FilterSearchParamType } from '@/types/product';
import ListViewProductCard from './list-view-card';
import ProductViewChange from './product-view-change';

export default async function ProductsSection({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    const { category, ...rest } = searchParams;

    let categoryIds: string | null = null;

    let paramsData: ParamsDataType = { ...rest };

    if (category) {
        const categoryIdArray = await getCategoryMongoId(
            `?category=${category}`
        );
        if (categoryIdArray) {
            categoryIds = categoryIdArray.join('|');
            paramsData = {
                ...paramsData,
                category: categoryIds,
            };
        }
    }

    const params = new URLSearchParams(paramsData);

    const products = await getProducts(`?${params.toString()}`);

    return (
        <>
            {products && (
                <ProductViewChange
                    listViewCard={products.map((product) => (
                        <ListViewProductCard
                            key={product.id}
                            details={product}
                        />
                    ))}>
                    {products.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </ProductViewChange>
                // <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-8 print:mt-4 print:sm:grid-cols-5 print:gap-1 ">

                // </div>
            )}
        </>
    );
}

export interface ParamsDataType {
    category?: string;
    price?: string;
    size?: string;
}
