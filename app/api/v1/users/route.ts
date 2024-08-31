import { auth } from '@/auth/auth';
import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { ADMIN } from '@/lib/constant-value';
import { User } from '@/lib/schemas/mongoose/user';
import { UserWith_id } from '@/types/mongoose-models';
import replaceMongoId from '@/utils/replace-mongo-id';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const session = await auth();

    try {
        if (!session) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const isAdmin = session?.user?.role === ADMIN;

        if (!isAdmin) {
            return NextResponse.json(
                {
                    error: 'Forbidden: You do not have permission to add products.',
                },
                { status: 403 }
            );
        }

        await connectMongoDB();

        const response: UserWith_id[] = await User.find(
            {},
            'fullName email image phone role username registerAt'
        ).lean();

        const users = replaceMongoId(response);

        return NextResponse.json(
            {
                users,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Inter nal server Error.', error },
            { status: 500 }
        );
    }
}
