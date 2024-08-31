import { auth } from '@/auth/auth';
import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { Product } from '@/lib/schemas/mongoose/product';
import { MongoServerError } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();
        const body = await request.json();

        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const isAdmin = session?.user?.role === ADMIN;
        const isCreator = session?.user?.role === CREATOR;

        if (!isAdmin && !isCreator) {
            return NextResponse.json(
                {
                    error: 'Forbidden: You do not have permission to add products.',
                },
                { status: 403 }
            );
        }

        if (!body) {
            return NextResponse.json(
                { error: 'Body product info required.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const productObj = { ...body, author: session.user.id };

        const isCreate = await Product.create(productObj);

        return NextResponse.json(
            { message: 'Product add successful.', isCreate },
            { status: 201 }
        );
    } catch (error) {
        const typeError = error as MongoServerError;

        if (typeError.code === 11000) {
            const pattern: string | null =
                typeof typeError.keyPattern === 'object'
                    ? Object.keys(typeError.keyPattern)[0]
                    : null;

            let message = '';

            if (pattern === 'slug')
                message =
                    'Product slug already exist, Slug value must be unique';

            return NextResponse.json(
                {
                    message,
                    pattern,
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: 'Inter nal server Error.' },
            { status: 500 }
        );
    }
}
