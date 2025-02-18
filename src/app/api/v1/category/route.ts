import { connectMongoDB } from '@/db/connections';
import { Category } from '@/lib/schemas/mongoose/category';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        /**
         * connect mongodb use mongoose.
         */

        await connectMongoDB();

        const showColumns = 'name slug imgUrl';
        const response = await Category.find({}, showColumns).lean();

        /**
         * Array to mongodb `_id` replace `id`
         */
        const categories = response.map((item) => {
            const { _id, ...rest } = item;
            return {
                id: _id,
                ...rest,
            };
        });

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
