import connectMongo from '@/mongodb/connection/mongodb-connect';
import User from '@/mongodb/models/user';
import { NextResponse } from 'next/server';

export async function POST(request) {
    const body = await request.json();

    try {
        await connectMongo(); // MongoDB connection created

        const createUser = await User.create({ ...body });

        return new NextResponse({
            status: 201,
            message: 'User created successfully',
            user: createUser,
        });
    } catch (error) {
        console.error('Error creating user:', error);

        return NextResponse.error('Error creating user', { status: 500 });
    }
}
