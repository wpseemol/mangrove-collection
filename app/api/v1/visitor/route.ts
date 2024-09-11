import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { Visitor } from '@/lib/schemas/mongoose/visitor';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(body && body.visitorId)) {
            return NextResponse.json(
                {
                    message:
                        'Bad Request: Missing required fields visitorId or expires required.',
                },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const visitor = await Visitor.create({
            visitorId: body.visitorId,
            expires: body.expires,
        });
        return NextResponse.json(
            { message: 'Successful save user info.', visitor: visitor },
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

        if (!(body && body.id)) {
            return NextResponse.json(
                { message: 'Bad Request: Missing required fields.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        // if already Exist find on then delete an update

        // console.log('api body:', body);
        // console.log('api body deleted id:', !!body.deleteId);

        const isUpdate = await Visitor.findOneAndUpdate(
            { visitorId: body.id },
            {
                visitorId: body.visitorId,
                expires: body.expires,
                lastVisitAt: new Date(),
                isLogin: body.isLogin,
            }
        );

        if (!isUpdate) {
            return NextResponse.json(
                {
                    message: 'Update failed because the item was not found.',
                    visitor: isUpdate,
                    isUpdate,
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            { message: 'Update successful.', visitor: isUpdate, isUpdate },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}
