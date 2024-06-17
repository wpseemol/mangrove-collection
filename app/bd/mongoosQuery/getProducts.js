'use server';

import connectMongo from '@/mongodb/connection/mongodb-connect';
import { Product } from '@/mongodb/models/products';
import replaceMongoId from '@/utils/replaceMongoId';

export default async function getProducts(type) {
    try {
        await connectMongo();

        let sortStage = {};
        let limit = 20; // Default limit for other types

        if (type === 'popular-product') {
            sortStage = {
                $sort: {
                    popularity: -1,
                },
            };
            limit = 10;
        } else if (type === 'new-arrival') {
            sortStage = {
                $sort: {
                    createdAt: -1,
                },
            };
            limit = 5;
        }

        // Build the aggregation pipeline
        const pipeline = [
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: 'categorySlug', // Ensure this matches your actual field name in categories collection
                    as: 'categoryDetails',
                },
            },
            {
                $unwind: '$categoryDetails', // Unwind the array to get object data
            },
        ];

        // Add the sort stage conditionally
        if (Object.keys(sortStage).length !== 0) {
            pipeline.push(sortStage);
        }

        // Add the project stage
        pipeline.push({
            $project: {
                productName: 1,
                thumbnail: 1,
                slug: 1,
                unit: 1,
                price: 1,
                currency: 1,
                shortDescription: 1,
                offer: 1,
                category: {
                    name: '$categoryDetails.categoryName',
                    slug: '$categoryDetails.categorySlug',
                }, // Rename categoryDetails.name to category
            },
        });

        // Add the limit stage
        pipeline.push({
            $limit: limit,
        });

        const allProduct = await Product.aggregate(pipeline).exec();

        return replaceMongoId(allProduct);
    } catch (error) {
        throw error;
    }
}
