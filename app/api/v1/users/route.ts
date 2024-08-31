import { data } from '@/app/(adimOrCreator)/dashboard/users/_component/columns';
import { auth } from '@/auth/auth';
import { ADMIN } from '@/lib/constant-value';
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

        const isAdmin = !(session?.user?.role === ADMIN);

        if (!isAdmin) {
            return NextResponse.json(
                {
                    error: 'Forbidden: You do not have permission to add products.',
                },
                { status: 403 }
            );
        }

        return NextResponse.json(
            {
                data,
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
