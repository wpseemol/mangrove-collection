import { connectMongoDB } from '@/db/connections';
import { Category } from '@/lib/schemas/mongoose/category';
import { Product } from '@/lib/schemas/mongoose/product';
import { replaceMongodbId } from '@/utils/replace-mongo-Ids';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        /**
         * connect mongodb use mongoose.
         */

        const slug = (await params).slug;

        await connectMongoDB();

        const productDetailsResponse = await Product.findOne({ slug })
            .populate({
                path: 'category',
                model: Category,
                select: 'name slug',
            })
            .lean();

        const productDetails = replaceMongodbId(productDetailsResponse);

        return NextResponse.json(
            {
                message: 'Product details get successful.',
                data: productDetails,
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
