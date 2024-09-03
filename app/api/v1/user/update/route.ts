import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        return NextResponse.json(
            { message: 'successful login user update' },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error.', error },
            { status: 500 }
        );
    }
}
