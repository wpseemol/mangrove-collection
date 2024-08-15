'use server';

import {
    AllCategoryType,
    CategoryWith_IdCount,
    CategoryWithCountType,
    CategoryWithMongo_Id,
} from '@/types/mongoose-models';
import replaceMongoId from '@/utils/replace-mongo-id';
import mongoose from 'mongoose';
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
                    return replaceMongoId(
                        allCategoryWithProductCount
                    ) as CategoryWithCountType[];
                } else {
                    return null;
                }

            default:
                const allCategory: CategoryWithMongo_Id[] =
                    await Category.find().lean();

                if (allCategory) {
                    return replaceMongoId(allCategory) as AllCategoryType[];
                } else {
                    return null;
                }
        }
    } catch (error) {
        throw error;
    }
}

async function getCategoryMongoId(slugArray: string[]) {
    try {
        await connectMongoDB();

        const response: CategoryIdsType[] = await Category.find(
            {
                slug: { $in: slugArray },
            },
            '_id'
        ).lean();

        if (response && response.length > 0) {
            const categoryIds = response.map((category) =>
                category._id.toString()
            );
            return categoryIds;
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}

interface CategoryIdsType {
    _id: mongoose.Schema.Types.ObjectId;
}

export { getCategory, getCategoryMongoId };
