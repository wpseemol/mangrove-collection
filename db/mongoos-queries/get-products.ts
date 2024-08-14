'use server';

import { ProductWithMongo_Id } from '@/types/mongoose-models';
import { connectMongoDB } from '../connections/mongoose-connect';
import { Category } from '../models/category';
import { Product } from '../models/product';

type ProductType =
    | 'popular-product'
    | 'new-arrival'
    | 'related-product'
    | 'filter';

interface IPriceType {
    maxPrice: number;
    minPrice: number;
}

export default async function getProducts(
    type: ProductType | null = null,
    categoryIds: string[] | null = null,
    price: IPriceType | null = null,
    size: string | null = null,
    excludeProductId: string | null = null
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
                    .lean();

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
                            .lean();

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

                if (price) {
                    findOption = {
                        $match: {
                            'price.price': {
                                $gte: price.minPrice,
                                $lte: price.maxPrice,
                            },
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
            .lean();

        if (products) {
            // replace mongo id here
            return products
                ?.map((obj) => ({ id: obj._id.toString(), ...obj }))
                .map(({ _id, ...rest }) => rest);
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

const showField = 'name slug offer images currency price unit thumbnail';