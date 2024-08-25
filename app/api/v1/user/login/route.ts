import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { User } from '@/lib/schemas/mongoose/user';
import bcryptjs from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    const body = await request.json();

    if (!(body?.email && body.password)) {
        return NextResponse.json(
            {
                message: 'body Email and password are required for login.',
            },
            { status: 400 }
        );
    }

    try {
        await connectMongoDB();
        const findUser = await User.findOne({ email: body?.email });

        if (!findUser) {
            return NextResponse.json(
                {
                    message: 'User not found.',
                },
                { status: 404 }
            );
        }

        const passwordMatch = await bcryptjs.compare(
            body?.password,
            findUser?.password
        );

        if (!passwordMatch) {
            return NextResponse.json(
                {
                    message: 'Password is incorrect',
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                user: {
                    id: findUser?._id?.toString(),
                    username: findUser?.username,
                    name: findUser?.fullName,
                    phone: findUser?.phone,
                    role: findUser?.role,
                },
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            {
                message: 'Some thing is wrong',
            },
            { status: 500 }
        );
    }
}
