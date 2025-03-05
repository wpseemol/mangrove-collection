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

        let slugArray: string[] = [];
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get('category');

        if (query) {
            const decodedCategory = decodeURI(query);
            slugArray = decodedCategory.split('|');
        }

        const showColumns = '_id';
        const mongodbResponse = await Category.find(
            {
                slug: { $in: slugArray },
            },
            showColumns
        ).lean();

        /**
         * Array to mongodb `_id` replace `id`
         */
        const categoriesIds = replaceMongoIds(mongodbResponse);

        return NextResponse.json(
            {
                message: 'Get category successful.',
                data: categoriesIds,
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
