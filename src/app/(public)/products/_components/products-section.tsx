import { getProducts } from '@/server/products';
import { FilterSearchParamType } from '@/types/product';

export default async function ProductsSection({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    // const { category, price, size } = searchParams;

    // let categoryIds: string[] | null = null;

    // if (category) {
    //     categoryIds = await getCategoryMongoId(`?category=${category}`);
    // }

    const params = new URLSearchParams(searchParams);

    await getProducts(`?${params.toString()}`);

    return <div>Products</div>;
}
