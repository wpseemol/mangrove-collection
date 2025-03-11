import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface CartItem {
    productId: string;
    quantity: number;
}

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function GET(request: NextRequest) {
    try {
        // Retrieve cart from cookies
        const cartCookie = request.cookies.get('cart')?.value;
        let cart: CartItem[] = [];

        // Decrypt the cart data if it exists
        if (cartCookie) {
            try {
                const decoded = jwt.verify(cartCookie, SECRET_KEY) as {
                    cart: CartItem[];
                };
                cart = decoded.cart;
            } catch (error) {
                console.error('Invalid JWT:', error);
                return NextResponse.json(
                    { message: 'Invalid cart data in JWT.' },
                    { status: 400 }
                );
            }
        }

        // Extract product IDs
        const productIds = cart.map((item) => item.productId);

        // Calculate total items in cart
        const totalItems = cart.length;

        return NextResponse.json(
            {
                message: 'Cart retrieved successfully.',
                success: true,
                cart,
                productIds,
                totalItems,
            },
            { status: 200 }
        );
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
