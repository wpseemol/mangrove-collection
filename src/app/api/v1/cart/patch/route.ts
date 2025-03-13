import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function PATCH(request: NextRequest) {
    try {
        const body = (await request.json()) as CartItem;

        if (!body?.productId || !body?.quantity) {
            return NextResponse.json(
                {
                    message: 'Product ID and quantity are required.',
                    success: false,
                },
                { status: 400 }
            );
        }

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
                    { message: 'Invalid purchase data in JWT.' },
                    { status: 400 }
                );
            }
        }

        // Update cart
        const existingItemIndex = cart.findIndex(
            (item) => item.productId === body.productId
        );
        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity = body.quantity;
        } else {
            cart.push(body);
        }

        // Encrypt the updated cart data with JWT
        const token = jwt.sign({ cart: cart }, SECRET_KEY, {
            expiresIn: '1y',
        }); // Expires in 1 year

        // Store encrypted cart in cookies
        const response = NextResponse.json(
            {
                message: 'Cart Product updated successfully.',
                success: true,
                date: cart,
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

interface CartItem {
    productId: string;
    quantity: number;
}
