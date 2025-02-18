import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { SortOrder } from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectMongoDB();

        const sortOption: { [key: string]: SortOrder } = { popularity: -1 };
        const limitOption = 10;
        const showColumns = 'name slug images thumbnail currency price';
        // '';

        const response = await Product.find({}, showColumns)
            .sort(sortOption)
            .limit(limitOption)
            .lean();

        /**
         * Array to mongodb `_id` replace `id`
         */
        const popularProducts = response.map((item) => {
            const { _id, ...rest } = item;
            return {
                id: _id,
                ...rest,
            };
        });

        return NextResponse.json(
            {
                message: 'Popular Product get successful.',
                data: popularProducts,
            },
            {
                status: 200,
            }
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
