import { auth } from '@/auth/auth';
import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { Category } from '@/lib/schemas/mongoose/category';
import { CategoryWithMongo_Id } from '@/types/mongoose-models';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(required: NextRequest) {
    try {
        await connectMongoDB();

        const response: CategoryWithMongo_Id[] = await Category.find().lean();

        if (!response) {
            return NextResponse.json(
                { message: 'Category not found.' },
                { status: 404 }
            );
        }

        if (response.length > 0) {
            const allCategory = response
                ?.map((obj) => {
                    return { id: obj._id.toString(), ...obj };
                })
                .map(({ _id, ...rest }) => rest);
            return NextResponse.json(allCategory, { status: 200 });
        } else {
            return NextResponse.json(
                { message: 'Category not found.' },
                { status: 404 }
            );
        }
    } catch (error: any) {
        return NextResponse.json(
            { message: error?.message || 'Internal server error.' },
            { status: 500 }
        );
    }
}

// post or add category

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
                    error: 'Forbidden: You do not have permission to add Category.',
                },
                { status: 403 }
            );
        }

        if (!body) {
            return NextResponse.json(
                { error: 'Body category info required.' },
                { status: 400 }
            );
        }
    } catch (error) {}
}
