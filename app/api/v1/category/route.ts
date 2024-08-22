import { connectMongoDB } from '@/db/connections/mongoose-connect';
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
