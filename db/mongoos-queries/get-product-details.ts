'use server';

import {
    ProductDetailsType,
    ProductDetailsWith_idType,
} from '@/types/products';
import replaceMongoObjectId from '@/utils/replace-mongo-object-id';
import { Category } from '../../lib/schemas/mongoose/category';
import { Product } from '../../lib/schemas/mongoose/product';
import { connectMongoDB } from '../connections/mongoose-connect';

export default async function getProductDetails(
    slug: string
): Promise<ProductDetailsType | null> {
    try {
        await connectMongoDB();

        const response: ProductDetailsWith_idType | null =
            await Product.findOne({
                slug,
            })
                .populate({
                    path: 'category',
                    model: Category,
                    select: 'name slug imgUrl',
                })
                .lean<ProductDetailsWith_idType | null>();
        if (response) {
            return replaceMongoObjectId(response);
        } else {
            return null;
        }
    } catch (error) {
        throw error;
    }
}
