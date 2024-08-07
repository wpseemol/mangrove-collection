import connectMongo from '@/mongodb/connection/mongodb-connect';
import User from '@/mongodb/models/user';
import bcryptjs from 'bcryptjs';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();

    try {
        await connectMongo(); // MongoDB connection created

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

        return new NextResponse(
            {
                message: 'User created successfully',
                user: createUser,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating user:', error);

        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        );
    }
}
