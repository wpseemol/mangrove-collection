import { connectMongoDB } from '@/db/connections';
import { User } from '@/lib/schemas/mongoose/user';
import { loginSchema } from '@/lib/schemas/zod/login-schema';
import { replaceMongodbId } from '@/utils/replace-mongo-Ids';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const validatedData = loginSchema.safeParse(body);
        if (!validatedData.success) {
            // Extract validation errors
            const formattedErrors = validatedData.error.flatten().fieldErrors;

            // Get the first error message from the object
            const firstErrorMessage = Object.values(formattedErrors)
                .flat()
                .filter(Boolean)[0];

            return NextResponse.json(
                {
                    message: firstErrorMessage || 'Validation failed.',
                    errors: formattedErrors,
                },
                { status: 400 }
            );
        }

        // const salt = await bcrypt.genSaltSync(10);
        // const password = await bcrypt.hashSync(
        //     validatedData.data.password,
        //     salt
        // );
        // password hash

        const { email, password } = validatedData.data;

        /**
         * connect mongodb use mongoose.
         */
        await connectMongoDB();

        const loginUserResponse = await User.findOne({ email }).lean();

        if (!loginUserResponse) {
            return NextResponse.json(
                { message: 'User not found.' },
                { status: 404 }
            );
        }

        const loginUser = replaceMongodbId(loginUserResponse) as LoginUser;

        /**
         * password match
         */

        const passwordMatch = await bcrypt.compare(
            password,
            loginUser.password
        );

        if (!passwordMatch) {
            return NextResponse.json(
                {
                    message: 'Password is not correct.',
                },
                { status: 401 }
            );
        }

        const user: UserType = {
            id: loginUser.id,
            fullName: loginUser.fullName,
            email: loginUser.email,
            role: loginUser.role,
            image: loginUser.image,
        };

        return NextResponse.json(
            {
                message: `User login successful.`,
                data: user,
            },
            { status: 201 }
        );
    } catch (error: unknown) {
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

interface UserType {
    id: string;
    fullName: string;
    email: string;
    role: 'admin' | 'user' | 'creator';
    image: string | null;
}

type LoginUser = UserType & { password: string };
