'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getCategory() {
    try {
        await connectMongo();
        const allCategory = await Category.find(
            {},
            'categoryImage categorySlug categoryName'
        ).lean();
        return replaceMongoId(allCategory);
    } catch (error) {
        throw error;
    }
}
