'use server';

import { connectMongoDB } from '../connections/mongoose-connect';
import { Category } from '../models/category';

async function getCategory() {
    try {
        await connectMongoDB();

        const allCategory = await Category.find().lean();

        if (allCategory) {
            return allCategory;
        } else {
            return [];
        }
    } catch (error) {
        throw error;
    }
}

export { getCategory };
