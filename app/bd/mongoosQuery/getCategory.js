'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getCategory() {
    try {
        await connectMongo();

        const allCategory = await Category.aggregate([
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: 'category',
                    as: 'products',
                },
            },
            {
                $project: {
                    categoryName: 1,
                    categorySlug: 1,
                    categoryImage: 1,
                    productCount: { $size: '$products' },
                },
            },
        ]).exec();

        console.log(allCategory);

        return replaceMongoId(allCategory);
    } catch (error) {
        throw error;
    }
}
