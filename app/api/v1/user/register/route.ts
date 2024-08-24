import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { User } from '@/lib/schemas/mongoose/user';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    try {
        await connectMongoDB(); // MongoDB connection created

        if (!(body?.email && body.password)) {
            return NextResponse.json(
                {
                    message:
                        'body Email and password are required for registration.',
                },
                { status: 400 }
            );
        }

        const password = bcryptjs.hashSync(body?.password, 10);

        const createUser = await User.create({
            ...body,
            password,
        });

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: createUser,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('register api router Error creating user:', error);

        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        );
    }
}
