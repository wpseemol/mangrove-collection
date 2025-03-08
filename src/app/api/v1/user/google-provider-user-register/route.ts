import { connectMongoDB } from '@/db/connections';
import { User } from '@/lib/schemas/mongoose/user';
import { replaceMongodbId } from '@/utils/replace-mongo-Ids';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body: GoogleLoginUserInfo = await request.json();

        if (!body.email || !body.name) {
            return NextResponse.json(
                {
                    message: `Email and Name is required fields.`,
                    data: body,
                },
                { status: 402 }
            );
        }

        await connectMongoDB();

        const showField = 'role email name image';

        const findUser = await User.findOne(
            { email: body.email },
            showField
        ).lean();

        if (findUser) {
            const withUserId = replaceMongodbId(findUser);

            return NextResponse.json(
                {
                    message: `User register successful.`,
                    data: withUserId,
                },
                { status: 200 }
            );
        }

        const createUserObj: CreateUserObjType = {
            name: body.name,
            email: body.email,
            image: body.image,
            provider: 'google',
        };

        const createUserResponse = await User.create(createUserObj);

        return NextResponse.json(
            {
                message: `User register successful.`,
                data: {
                    id: createUserResponse._id,
                    name: createUserResponse.name,
                    email: createUserResponse.email,
                    image: createUserResponse.image,
                    role: createUserResponse.role,
                },
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

interface GoogleLoginUserInfo {
    name: string;
    email: string;
    image: string | null;
}

interface CreateUserObjType {
    name: string;
    email: string;
    image: string | null;
    provider: string;
}
