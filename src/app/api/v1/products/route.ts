import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        /**
         * connect mongodb use mongoose.
         */

        await connectMongoDB();

        const searchParams = request.nextUrl.searchParams;
        const category = searchParams.get('category');
        const price = searchParams.get('price');
        const size = searchParams.get('size');

        const priceObj: PriceObjType = {
            minPrice: null,
            maxPrice: null,
        };

        let findOption = {};

        if (category) {
            const categoryIds = category.split('|');
            findOption = { ...findOption, category: { $in: categoryIds } };
        }

        if (price) {
            const priceArr = price?.split('-');
            if (!isNaN(parseInt(priceArr[0]))) {
                priceObj.minPrice = parseInt(priceArr[0]);
            }
            if (!isNaN(parseInt(priceArr[1]))) {
                priceObj.maxPrice = parseInt(priceArr[1]);
            }

            if (
                priceObj.maxPrice &&
                priceObj.minPrice &&
                priceObj.maxPrice > priceObj.minPrice
            ) {
                findOption = {
                    ...findOption,
                    'price.price': {
                        $gte: priceObj.minPrice,
                        $lte: priceObj.maxPrice,
                    },
                };
            }
        }

        if (size && sizeArray.includes(size)) {
            findOption = {
                ...findOption,
                size: size,
            };
        }

        const showField = 'name';

        const mongodbResponse = await Product.find(
            findOption,
            showField
        ).lean();

        const products = replaceMongoIds(mongodbResponse);

        return NextResponse.json(
            {
                message: 'Product get successful.',
                data: products,
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
