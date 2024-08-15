'use server';

import {
    CategoryWith_IdCount,
    CategoryWithMongo_Id,
} from '@/types/mongoose-models';
import replaceMongoId from '@/utils/replace-mongo-id';
import { connectMongoDB } from '../connections/mongoose-connect';
import { Category } from '../models/category';

type GetCategoryType = 'withCountProduct';

async function getCategory(type?: GetCategoryType) {
    try {
        await connectMongoDB();

        switch (type) {
            case 'withCountProduct':
                const allCategoryWithProductCount: CategoryWith_IdCount[] =
                    await Category.aggregate([
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
                                name: 1,
                                slug: 1,
                                productCount: { $size: '$products' },
                            },
                        },
                    ]).exec();

                if (allCategoryWithProductCount) {
                    return replaceMongoId(allCategoryWithProductCount);
                } else {
                    return null;
                }

            default:
                const allCategory: CategoryWithMongo_Id[] =
                    await Category.find().lean();

                if (allCategory) {
                    return replaceMongoId(allCategory);
                } else {
                    return null;
                }
        }
    } catch (error) {
        throw error;
    }
}

export { getCategory };
