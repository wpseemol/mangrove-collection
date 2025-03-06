import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const skipId = searchParams.get('skipId');
        const categoryId = searchParams.get('categoryId');

        // check category and skipId
        if (!categoryId) {
            return NextResponse.json(
                {
                    message: 'categoryId required as search params.',
                    data: null,
                },
                { status: 400 }
            );
        }
        if (!skipId) {
            return NextResponse.json(
                {
                    message: 'skipId required as search params.',
                    data: null,
                },
                { status: 400 }
            );
        }
        // check category and skipId

        /**
         * connect mongodb use mongoose.
         */

        await connectMongoDB();

        const findOption = {
            category: categoryId,
            _id: { $ne: skipId },
        };

        const limitOption = 6;
        const showField =
            'name slug images thumbnail shortDescription currency price';

        const relatedProductResponse = await Product.find(findOption, showField)
            .limit(limitOption)
            .lean();

        const relatedProducts = replaceMongoIds(relatedProductResponse);

        return NextResponse.json(
            {
                message: 'Product get successful.',
                data: relatedProducts,
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
