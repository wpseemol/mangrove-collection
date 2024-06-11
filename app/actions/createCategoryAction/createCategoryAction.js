'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';

export default async function createCategoryAction(categoryObj) {
    let finalObj = {};

    categoryObj.forEach((value, key) => {
        finalObj[key] = value;
    });

    try {
        await connectMongo();
        const isCreated = await Category.create(finalObj);
        if (!!isCreated) {
            return 'created';
        }
    } catch (error) {
        throw error;
    }
}
