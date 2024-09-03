import { auth } from '@/auth/auth';
import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { ADMIN } from '@/lib/constant-value';
import { User } from '@/lib/schemas/mongoose/user';
import { MongoServerError } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const { userId } = params;
        const session = await auth();
        const body = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: 'User ID is required and must be a string.' },
                { status: 400 }
            );
        }

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
                    error: 'Forbidden: You do not have permission to change user role.',
                },
                { status: 403 }
            );
        }

        await connectMongoDB();

        const isUpdated = await User.findByIdAndUpdate(userId, {
            role: body.role,
        });

        if (!isUpdated) {
            return NextResponse.json(
                { error: 'User not found.' },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { isUpdated, message: 'User role updated successfully.' },
            {
                status: 200,
            }
        );
    } catch (error) {
        const errorType = error as MongoServerError;

        return NextResponse.json(
            { message: errorType.message || 'Internal server error.', error },
            { status: 500 }
        );
    }
}
