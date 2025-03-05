import { FilterSearchParamType } from '@/types/product';

export default function ProductsSection({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    // const { category, price, size } = searchParams;

    // let categoryArray: string[] = [];
    // const priceObj: PriceObjType = {
    //     minPrice: null,
    //     maxPrice: null,
    // };
    // let productSize: string | null = null;

    // if (category) {
    //     const decodedCategory = decodeURI(category);
    //     categoryArray = decodedCategory?.split('|');
    // }
    // if (price) {
    //     const priceArr = price?.split('-');
    //     if (!isNaN(parseInt(priceArr[0]))) {
    //         priceObj.minPrice = parseInt(priceArr[0]);
    //     }
    //     if (!isNaN(parseInt(priceArr[1]))) {
    //         priceObj.maxPrice = parseInt(priceArr[1]);
    //     }
    // }

    // if (size) {
    //     if (sizeArray.includes(size)) productSize = size;
    // }

    //  const categoryIds: string[] | null = await getCategoryMongoId(
    //      categoryArray
    //  );

    //  const allProduct = await getProducts(
    //      'filter',
    //      categoryIds,
    //      priceObj,
    //      productSize
    //  );

    return <div>{JSON.stringify(searchParams)}</div>;
}
