'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import { revalidatePath } from 'next/cache';

export default async function createCategoryAction(categoryObj) {
    let finalObj = {};

    categoryObj.forEach((value, key) => {
        finalObj[key] = value;
    });

    try {
        await connectMongo();
        const isCreated = await Category.create(finalObj);
        if (!!isCreated) {
            revalidatePath('/');
            revalidatePath('/dashboard/upload-product');
            return 'created';
        }
    } catch (error) {
        if (
            error.code === 11000 &&
            error.keyPattern &&
            error.keyPattern.categorySlug
        ) {
            return 'slug-massed';
        } else {
            console.log('some this is problem', error);

            throw error;
        }
    }
}
