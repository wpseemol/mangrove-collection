import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = (await request.json()) as CartItem;

        if (!body.productId || body.quantity === undefined) {
            return NextResponse.json(
                { message: 'Product ID and quantity are required.' },
                { status: 400 }
            );
        }

        const cartCookie = request.cookies.get('cart')?.value;
        const cart: CartItem[] = cartCookie ? JSON.parse(cartCookie) : [];

        const existingItemIndex = cart.findIndex(
            (item) => item.productId === body.productId
        );

        if (existingItemIndex !== -1) {
            cart[existingItemIndex].quantity += body.quantity;
        } else {
            cart.push(body);
        }

        // Store updated cart in cookies
        const response = NextResponse.json(
            { message: 'Cart updated successfully.', cart },
            { status: 201 }
        );

        response.cookies.set('cart', JSON.stringify(cart), {
            httpOnly: true,
            secure: true, // Ensures cookies are sent over HTTPS
            maxAge: 31536000, // 1 year in seconds
            path: '/', // Available for the entire site
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
