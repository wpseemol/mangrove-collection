'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Category } from '@/mongodb/models/category';
import { Product } from '@/mongodb/models/products';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getProducts(type) {
    const showField =
        'productName category slug offer shortDescription currency price unit thumbnail';
    try {
        await connectMongo();

        let products = [];

        if ('popular-product' === type) {
            products = await Product.find({}, showField)
                .populate({
                    path: 'category',
                    model: Category,
                })
                .sort({ popularity: -1 })
                .limit(10)
                .lean();
        } else if ('new-arrival' === type) {
            products = await Product.find({}, showField)
                .populate({
                    path: 'category',
                    model: Category,
                })
                .sort({ createdAt: -1 })
                .limit(5)
                .lean();
        } else {
            products = await Product.find({}, showField)
                .populate({
                    path: 'category',
                    model: Category,
                })
                .lean();
        }

        return replaceMongoId(products);
    } catch (error) {
        throw error;
    }
}
