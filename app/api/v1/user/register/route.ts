import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { User } from '@/lib/schemas/mongoose/user';
import bcryptjs from 'bcryptjs';
import { MongoServerError } from 'mongodb';
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
        const { firstName, lastName, ...obj } = body;
        const fullName = `${body.firstName} ${body.lastName}`;

        const userRegObj = { fullName, password, ...obj };

        const createUser = await User.create(userRegObj);

        return NextResponse.json(
            {
                message: 'User created successfully',
                user: createUser,
            },
            { status: 201 }
        );
    } catch (error) {
        const typeError = error as MongoServerError;

        if (typeError.code === 11000) {
            const pattern: string | null =
                typeof typeError.keyPattern === 'object'
                    ? Object.keys(typeError.keyPattern)[0]
                    : null;

            let message = '';

            if (pattern === 'email')
                message = 'Email is already in use in another account.';
            if (pattern === 'username') message = 'Username is already in use.';
            if (pattern === 'phone')
                message = 'Phone number already in use in another account.';

            return NextResponse.json(
                {
                    message,
                    pattern,
                },
                { status: 409 }
            );
        }

        return NextResponse.json(
            { message: 'Inter nal server Error.' },
            { status: 500 }
        );
    }
}
