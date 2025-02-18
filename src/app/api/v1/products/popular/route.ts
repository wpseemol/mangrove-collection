import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectMongoDB();

        const response = await Product.find({}).lean();

        return NextResponse.json(
            {
                message: 'Popular Product get successful.',
                data: response,
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
