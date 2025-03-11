import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function POST(request: NextRequest) {
    try {
        const purchase = (await request.json()) as PurchaseItem[];

        // Validate input
        if (!purchase) {
            return NextResponse.json(
                { message: 'Product ID and quantity are required.' },
                { status: 400 }
            );
        }

        // Retrieve cart from cookies

        // Encrypt the updated cart data with JWT
        const token = jwt.sign({ purchase }, SECRET_KEY, {
            expiresIn: '1y',
        }); // Expires in 1 year

        // Store encrypted cart in cookies
        const response = NextResponse.json(
            {
                message: 'Purchase Product set cookies success',
                success: true,
                data: purchase,
            },
            { status: 201 }
        );
        response.cookies.set('purchase', token, {
            httpOnly: true,
            secure: true, // Ensure cookies are sent over HTTPS
            maxAge: 31536000, // 1 year in seconds
            path: '/', // Available across the entire site
        });

        return response;
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json(
                { message: error.message || 'Internal server error.' },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { message: 'An unknown error occurred.' },
            { status: 500 }
        );
    }
}

interface PurchaseItem {
    productId: string;
    quantity: number;
}
