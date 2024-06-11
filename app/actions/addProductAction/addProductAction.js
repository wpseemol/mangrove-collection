'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Product } from '@/mongodb/models/products';
import { revalidatePath } from 'next/cache';

export default async function addProductAction(productObject) {
    try {
        await connectMongo();
        const isCreated = await Product.create(productObject);

        if (!!isCreated) {
            revalidatePath('/');
            return 'created';
        }
    } catch (error) {
        if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
            return 'slug-massed';
        }

        throw error;
    }
}
