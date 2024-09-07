import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { Visitor } from '@/lib/schemas/mongoose/visitor';
import { ObjectId } from 'mongoose';
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
        return NextResponse.json(
            { message: 'Successful save user info.', visitor: response },
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
        // if already Exist find on then delete an update

        if (body.isLogin) {
            const isAlreadyHasUser = await Visitor.findOne({
                visitorId: body.visitorId,
            });

            if (isAlreadyHasUser) {
                const deleted = await Visitor.findOneAndDelete({
                    visitorId: body.id,
                }).lean<{ _id: ObjectId }>();

                const response = await Visitor.findOneAndUpdate(
                    { visitorId: body.visitorId },
                    {
                        visitorId: body.visitorId,
                        expires: body.expires,
                        lastVisitAt: new Date(),
                        isLogin: body.isLogin,
                        lastDeviceID: deleted?._id,
                    }
                );

                return NextResponse.json(
                    { message: 'Update successful.', visitor: response },
                    { status: 200 }
                );
            } else {
                const response = await Visitor.findOneAndUpdate(
                    { visitorId: body.id },
                    {
                        visitorId: body.visitorId,
                        expires: body.expires,
                        lastVisitAt: new Date(),
                        isLogin: body.isLogin,
                    }
                );

                if (!response) {
                    const visitor = await Visitor.create({
                        visitorId: body.visitorId,
                        expires: body.expires,
                        lastVisitAt: new Date(),
                        isLogin: body.isLogin,
                    });

                    return NextResponse.json(
                        { message: 'Update successful.', visitor },
                        { status: 200 }
                    );
                }

                return NextResponse.json(
                    { message: 'Update successful.', visitor: response },
                    { status: 200 }
                );
            }
        }
        // if already Exist find on then delete an update

        const response = await Visitor.findOneAndUpdate(
            { visitorId: body.id },
            {
                visitorId: body.visitorId,
                expires: body.expires,
                lastVisitAt: new Date(),
                isLogin: body.isLogin,
            }
        );

        if (!response) {
            const visitor = await Visitor.create({
                visitorId: body.visitorId,
                expires: body.expires,
                lastVisitAt: new Date(),
                isLogin: body.isLogin,
            });

            return NextResponse.json(
                { message: 'Update successful.', visitor },
                { status: 200 }
            );
        }

        return NextResponse.json(
            { message: 'Update successful.', visitor: response },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}
