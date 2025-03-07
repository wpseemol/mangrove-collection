import { connectMongoDB } from '@/db/connections';
import { User } from '@/lib/schemas/mongoose/user';
import { registerSchema } from '@/lib/schemas/zod/register-schema';
import bcrypt from 'bcryptjs';
import { MongoServerError } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validatedData = registerSchema.safeParse(body);
        if (!validatedData.success) {
            return NextResponse.json(
                {
                    message: validatedData.error,
                },
                {
                    status: 422,
                }
            );
        }

        const fullName = `${validatedData.data.firstName} ${validatedData.data.lastName}`;
        // password hash
        const salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hashSync(
            validatedData.data.password,
            salt
        );
        // password hash

        const { firstName, email, phone } = validatedData.data;

        const registerUser = {
            fullName,
            password,
            email,
            phone,
        };

        /**
         * connect mongodb use mongoose.
         */
        await connectMongoDB();

        await User.create(registerUser);

        return NextResponse.json(
            {
                message: `${firstName} user register successful.`,
                data: registerUser,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
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

        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || 'Internal server error.', error },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unknown error occurred.' },
            { status: 500 }
        );
    }
}
