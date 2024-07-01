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

        return replaceMongoId(allCategory);
    } catch (error) {
        throw error;
    }
}

export async function getCategoryMongoId(slugArray) {
    try {
        await connectMongo();

        const response = await Category.find(
            {
                categorySlug: { $in: slugArray },
            },
            '_id'
        ).lean();

        const categoryIds = response?.map((category) =>
            category?._id?.toString()
        );

        return categoryIds;
    } catch (error) {
        throw error;
    }
}
