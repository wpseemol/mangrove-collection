import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
import { SortOrder } from 'mongoose';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectMongoDB();

        const sortOption: { [key: string]: SortOrder } = { createdAt: -1 };
        const limitOption = 6;
        const showColumns = 'name slug images thumbnail currency price';

        const response = await Product.find({}, showColumns)
            .sort(sortOption)
            .limit(limitOption)
            .lean();

        const newArrivalProducts = replaceMongoIds(response);

        return NextResponse.json(
            {
                message: 'Product get successful.',
                data: newArrivalProducts,
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
