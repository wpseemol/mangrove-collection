import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

interface CartItem {
    productId: string;
    quantity: number;
}

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CartItem;

        // Validate input
        if (!body.productId || body.quantity === undefined) {
            return NextResponse.json(
                { message: 'Product ID and quantity are required.' },
                { status: 400 }
            );
        }

        // Retrieve cart from cookies
        const cartCookie = request.cookies.get('cart')?.value;
        let cart: CartItem[] = [];

        // Decrypt the cart data if it exists
        if (cartCookie) {
            try {
                const decoded = jwt.verify(cartCookie, SECRET_KEY) as {
                    cart: CartItem[];
                };

                if (Array.isArray(decoded.cart)) {
                    cart = decoded.cart;
                } else {
                    console.error('Invalid cart data in JWT');
                }
            } catch (error) {
                console.error('Invalid JWT:', error);
                return NextResponse.json(
                    { message: 'Invalid cart data in JWT.' },
                    { status: 400 }
                );
            }
        }

        // Update cart
        const existingItemIndex = cart.findIndex(
            (item) => item.productId === body.productId
        );
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += body.quantity;
        } else {
            cart.push(body);
        }

        // Encrypt the updated cart data with JWT
        const token = jwt.sign({ cart }, SECRET_KEY, { expiresIn: '1y' }); // Expires in 1 year

        // Extract product IDs
        const productIds = cart.map((item) => item.productId);

        // Calculate total items in cart
        const totalItems = cart.length;

        // Store encrypted cart in cookies
        const response = NextResponse.json(
            {
                message: 'Cart updated successfully.',
                success: true,
                cart,
                productIds,
                totalItems,
            },
            { status: 201 }
        );
        response.cookies.set('cart', token, {
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
