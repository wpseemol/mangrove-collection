import { getCategoryMongoId } from '@/server/category';
import { getProducts } from '@/server/products';
import { FilterSearchParamType } from '@/types/product';

export default async function ProductsSection({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    const { category, ...rest } = searchParams;

    let categoryIds: string | null = null;

    let paramsData = { ...rest };

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
        <div>
            Products
            <p>{JSON.stringify(products)}</p>
        </div>
    );
}
