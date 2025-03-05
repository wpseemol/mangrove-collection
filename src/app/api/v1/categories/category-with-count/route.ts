import { connectMongoDB } from '@/db/connections';
import { Category } from '@/lib/schemas/mongoose/category';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        /**
         * connect mongodb use mongoose.
         */

        await connectMongoDB();

        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('limit');

        // Convert to number and check if it's valid
        let limitNumber = parseInt(query, 10);
        if (isNaN(limitNumber) || limitNumber <= 0) {
            limitNumber = 5;
        }

        const pipeline = [
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
        ];

        if (query) {
            pipeline.push({
                $limit: limitNumber,
            });
        }

        const mongodbResponse = await Category.aggregate(pipeline).exec();

        /**
         * Array to mongodb `_id` replace `id`
         */
        const categoriesWithCount = replaceMongoIds(mongodbResponse);

        return NextResponse.json(
            {
                message: 'Get category successful.',
                data: categoriesWithCount,
            },
            { status: 200 }
        );
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || 'Internal server error.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unknown error occurred.' },
            { status: 500 }
        );
    }
}
