import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { Visitor } from '@/lib/schemas/mongoose/visitor';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(body && body.visitorId)) {
            return NextResponse.json(
                { message: 'Bad Request: Missing required fields.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const response = await Visitor.create(body);

        const { _id, ...visitor } = response.toObject();

        visitor.id = response._id;

        return NextResponse.json(
            { message: 'Successful save user info.', visitor },
            { status: 201 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}

export async function PATCH(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(body && body.visitorId)) {
            return NextResponse.json(
                { message: 'Bad Request: Missing required fields.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const response = await Visitor.findOneAndUpdate(
            { visitorId: body.id },
            {
                visitorId: body.visitorId,
                expires: body.expires,
                lastVisitAt: new Date(),
                isLogin: body.isLogin,
            }
        );

        const { _id, ...visitor } = response.toObject();

        visitor.id = response._id;

        return NextResponse.json(
            { message: 'Update successful.', visitor },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}
