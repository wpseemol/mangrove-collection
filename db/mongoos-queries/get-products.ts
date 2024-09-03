'use server';

import { ProductType, ProductWithMongo_Id } from '@/types/mongoose-models';
import { PriceObjType } from '@/types/products';
import replaceMongoId from '@/utils/replace-mongo-id';
import { Category } from '../../lib/schemas/mongoose/category';
import { Product } from '../../lib/schemas/mongoose/product';
import { connectMongoDB } from '../connections/mongoose-connect';

type GetProductType =
    | 'popular-product'
    | 'new-arrival'
    | 'related-product'
    | 'filter';

export default async function getProducts(
    type: GetProductType | null = null, // what type of product you want to get.
    categoryIds: string[] | null = null, // category ids give all product.
    price: PriceObjType | null = null, // price object is support minPrice and maxPrice it's number.
    size: string | null = null, // input size, it's string.
    excludeProductId: string | null = null // whose product you want to remove from the least.
) {
    try {
        await connectMongoDB();

        let sortOption = {};
        let limitOption = 0;
        let findOption = {};

        switch (type) {
            case 'popular-product':
                sortOption = { popularity: -1 };
                limitOption = 10;
                break;
            case 'new-arrival':
                sortOption = { createdAt: -1 };
                limitOption = 5;
                break;
            case 'related-product':
                if (categoryIds) {
                    findOption = {
                        category: categoryIds[0],
                        _id: { $ne: excludeProductId },
                    };
                } else {
                    sortOption = { popularity: -1 };
                }
                limitOption = 5;

                const products: ProductWithMongo_Id[] = await Product.find(
                    findOption,
                    showField
                )
                    .populate({
                        path: 'category',
                        model: Category,
                        select: 'name slug imgUrl',
                    })
                    .sort(sortOption)
                    .limit(limitOption)
                    .lean<ProductWithMongo_Id[]>();

                if (products?.length < 1) {
                    const popularProducts: ProductWithMongo_Id[] =
                        await Product.find(
                            { _id: { $ne: excludeProductId } },
                            showField
                        )
                            .populate({
                                path: 'category',
                                model: Category,
                                select: 'name slug imgUrl',
                            })
                            .sort({ popularity: -1 })
                            .limit(limitOption)
                            .lean<ProductWithMongo_Id[]>();

                    if (popularProducts) {
                        // replace mongo id here
                        return popularProducts
                            ?.map((obj) => ({ id: obj._id.toString(), ...obj }))
                            .map(({ _id, ...rest }) => rest);
                    } else {
                        return null;
                    }
                }

                if (products) {
                    return products
                        ?.map((obj) => ({ id: obj._id.toString(), ...obj }))
                        .map(({ _id, ...rest }) => rest);
                } else {
                    return null;
                }

            case 'filter':
                if (categoryIds) {
                    findOption = {
                        ...findOption,
                        category: { $in: categoryIds },
                    };
                }

                if (
                    price &&
                    price.maxPrice &&
                    price.minPrice &&
                    price.maxPrice > price.minPrice
                ) {
                    findOption = {
                        ...findOption,
                        'price.price': {
                            $gte: price.minPrice,
                            $lte: price.maxPrice,
                        },
                    };
                }

                if (size) {
                    findOption = {
                        ...findOption,
                        size: size,
                    };
                }

                break;
        }

        const products: ProductWithMongo_Id[] = await Product.find(
            findOption,
            showField
        )
            .populate({
                path: 'category',
                model: Category,
                select: 'name slug imgUrl',
            })
            .sort(sortOption)
            .limit(limitOption)
            .lean<ProductWithMongo_Id[]>();

        if (products) {
            // replace mongo id here

            return replaceMongoId(products) as ProductType[];
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

const showField =
    'name slug offer images currency price unit thumbnail category shortDescription';
