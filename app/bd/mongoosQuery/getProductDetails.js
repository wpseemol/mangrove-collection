'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import { Product } from '@/mongodb/models/products';
import replaceMongodbIdFromObject from '@/utils/replaceMongodbIdFromObject';

export default async function getProductDetails(slug) {
    try {
        await connectMongo();

        const productDetails = await Product.findOne({ slug })
            .populate({
                path: 'category',
                model: Category,
                select: 'categoryName categorySlug categoryImage',
            })
            .lean();

        return replaceMongodbIdFromObject(productDetails);
    } catch (error) {
        throw error;
    }
}
