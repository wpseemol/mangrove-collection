import ProductCard from '@/components/product-card';
import { getCategoryMongoId } from '@/db/mongoos-queries/get-category';
import getProducts from '@/db/mongoos-queries/get-products';
import { FilterSearchParamType, PriceObjType } from '@/types/products';
import { sizeArray } from '.';
import ProductViewChange from './product-view-change';

export default async function ProductSection({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    const { category, price, size } = searchParams;

    let categoryArray: string[] = [];
    let priceObj: PriceObjType = {
        minPrice: null,
        maxPrice: null,
    };
    let productSize: string | null = null;

    if (category) {
        const decodedCategory = decodeURI(category);
        categoryArray = decodedCategory?.split('|');
    }
    if (price) {
        const priceArr = price?.split('-');
        if (!isNaN(parseInt(priceArr[0]))) {
            priceObj.minPrice = parseInt(priceArr[0]);
        }
        if (!isNaN(parseInt(priceArr[1]))) {
            priceObj.maxPrice = parseInt(priceArr[1]);
        }
    }

    if (size) {
        if (sizeArray.includes(size)) productSize = size;
    }

    const categoryIds: string[] | null = await getCategoryMongoId(
        categoryArray
    );

    const allProduct = await getProducts(
        'filter',
        categoryIds,
        priceObj,
        productSize
    );

    return (
        <>
            {allProduct && (
                <ProductViewChange listViewCard={<div>List card</div>}>
                    {allProduct?.map((product) => (
                        <ProductCard key={product.id} details={product} />
                    ))}
                </ProductViewChange>
            )}
        </>
    );
}
