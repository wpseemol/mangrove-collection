'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import { Product } from '@/mongodb/models/products';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getProducts(type) {
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

        console.log(products);

        return replaceMongoId(products);
    } catch (error) {
        throw error;
    }
}
