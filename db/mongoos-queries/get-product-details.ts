'use server';

import {
    ProductDetailsType,
    ProductDetailsWith_idType,
} from '@/types/products';
import replaceMongoObjectId from '@/utils/replace-mongo-object-id';
import { connectMongoDB } from '../connections/mongoose-connect';
import { Product } from '../models/product';

export default async function getProductDetails(
    slug: string
): Promise<ProductDetailsType | null> {
    try {
        await connectMongoDB();

        const response: ProductDetailsWith_idType | null =
            await Product.findOne({
                slug,
            }).lean();
        if (response) {
            return replaceMongoObjectId(response);
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}
