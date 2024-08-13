'use server';

import { CategoryWithMongo_Id } from '@/types/mongoose-models';
import { connectMongoDB } from '../connections/mongoose-connect';
import { Category } from '../models/category';

async function getCategory() {
    try {
        await connectMongoDB();

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
    } catch (error) {
        throw error;
    }
}

export { getCategory };
