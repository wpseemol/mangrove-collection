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
            // Extract validation errors
            const formattedErrors = validatedData.error.flatten().fieldErrors;

            // Get the first error message from the object
            const firstErrorMessage = Object.values(formattedErrors)
                .flat()
                .filter(Boolean)[0];

            return NextResponse.json(
                {
                    message: firstErrorMessage || 'Validation failed',
                    errors: formattedErrors,
                },
                { status: 400 }
            );
        }

        const name = `${validatedData.data.firstName} ${validatedData.data.lastName}`;
        // password hash
        const salt = await bcrypt.genSaltSync(10);
        const password = await bcrypt.hashSync(
            validatedData.data.password,
            salt
        );
        // password hash

        const { firstName, email, phone } = validatedData.data;

        const registerUser = {
            name,
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
                    errors: error,
                },
                { status: 409 }
            );
        }

        if (error instanceof Error) {
            return NextResponse.json(
                {
                    message: error.message || 'Internal server error.',
                    errors: error,
                },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unknown error occurred.', errors: error },
            { status: 500 }
        );
    }
}
