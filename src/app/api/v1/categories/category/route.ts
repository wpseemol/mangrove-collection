import { connectMongoDB } from '@/db/connections';
import { Category } from '@/lib/schemas/mongoose/category';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        /**
         * connect mongodb use mongoose.
         */

        await connectMongoDB();

        const showColumns = 'name slug imgUrl';
        const mongodbResponse = await Category.find({}, showColumns).lean();

        /**
         * Array to mongodb `_id` replace `id`
         */
        const categories = replaceMongoIds(mongodbResponse);

        return NextResponse.json(
            {
                message: 'Get category successful.',
                data: categories,
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
