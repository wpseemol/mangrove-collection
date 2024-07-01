'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import { Product } from '@/mongodb/models/products';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getProducts(
    type,
    categoryIds = [],
    price,
    size,
    excludeProductId
) {
    const showField =
        'productName category slug offer shortDescription currency price unit thumbnail';
    try {
        await connectMongo();

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
                if (categoryIds[0]) {
                    findOption = {
                        category: categoryIds[0],
                        _id: { $ne: excludeProductId },
                    };
                } else {
                    findOption = {
                        _id: { $ne: excludeProductId },
                    };
                    sortOption = { popularity: -1 };
                }
                limitOption = 5;

                const products = await Product.find(findOption, showField)
                    .populate({
                        path: 'category',
                        model: Category,
                        select: 'categoryName categorySlug categoryImage',
                    })
                    .sort(sortOption)
                    .limit(limitOption)
                    .lean();

                if (products?.length < 1) {
                    const popularProducts = await Product.find(
                        { _id: { $ne: excludeProductId } },
                        showField
                    )
                        .populate({
                            path: 'category',
                            model: Category,
                            select: 'categoryName categorySlug categoryImage',
                        })
                        .sort({ popularity: -1 })
                        .limit(limitOption)
                        .lean();

                    console.log(popularProducts);

                    return replaceMongoId(popularProducts);
                }

                return replaceMongoId(products);

            case 'filter':
                if (categoryIds.length > 0) {
                    findOption = {
                        ...findOption,
                        category: { $in: categoryIds },
                    };
                }

                if (price.minPrice && price.maxPrice) {
                    findOption = {
                        ...findOption,
                        price: { $gte: price.minPrice, $lte: price.maxPrice },
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

        const products = await Product.find(findOption, showField)
            .populate({
                path: 'category',
                model: Category,
                select: 'categoryName categorySlug categoryImage',
            })
            .sort(sortOption)
            .limit(limitOption)
            .lean();

        return replaceMongoId(products);
    } catch (error) {
        throw error;
    }
}
