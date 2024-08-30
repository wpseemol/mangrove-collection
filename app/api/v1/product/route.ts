import { auth } from '@/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        // console.log('post product api:', session);

        return NextResponse.json({ session }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 });
    }
}
