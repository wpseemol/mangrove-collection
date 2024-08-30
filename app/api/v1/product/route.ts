import { auth } from '@/auth/auth';
import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { Product } from '@/lib/schemas/mongoose/product';
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

        const isAdmin = !(session?.user?.role === ADMIN);
        const isCreator = !(session?.user?.role === CREATOR);

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

        console.log(productObj);

        const isCreate = await Product.create(productObj);

        return NextResponse.json(
            { message: 'Product add successful.', isCreate },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
