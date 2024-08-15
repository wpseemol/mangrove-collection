'use server';

import {
    CategoryWith_IdCount,
    CategoryWithMongo_Id,
} from '@/types/mongoose-models';
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

                console.log('getCategory:', allCategoryWithProductCount);

                if (allCategoryWithProductCount) {
                    return allCategoryWithProductCount
                        ?.map((obj) => {
                            return { id: obj._id.toString(), ...obj };
                        })
                        .map(({ _id, ...rest }) => rest);
                } else {
                    return null;
                }

            default:
                const allCategory: CategoryWithMongo_Id[] =
                    await Category.find().lean();

                if (allCategory) {
                    return allCategory
                        ?.map((obj) => {
                            return { id: obj._id.toString(), ...obj };
                        })
                        .map(({ _id, ...rest }) => rest);
                } else {
                    return null;
                }
        }
    } catch (error) {
        throw error;
    }
}

export { getCategory };
