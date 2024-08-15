import { getCategoryMongoId } from '@/db/mongoos-queries/get-category';
import getProducts from '@/db/mongoos-queries/get-products';
import { FilterSearchParamType, PriceObjType } from '@/types/products';
import { sizeArray } from '.';

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
        <div>
            all products length:{' '}
            <pre className="text-wrap">
                {allProduct &&
                    allProduct.map((item, inx) => (
                        <pre key={item.id} className="text-wrap">
                            <p>
                                {' '}
                                <span>{inx + 1}.</span>
                                {item.name}
                            </p>
                            {item.price.map((element) => (
                                <span key={element.variantId}>
                                    {element.price}
                                    <br />
                                </span>
                            ))}
                        </pre>
                    ))}
            </pre>
            <pre>{JSON.stringify(priceObj)}</pre>
        </div>
    );
}
