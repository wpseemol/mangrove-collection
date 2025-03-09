import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Retrieve cart from cookies
        const cartCookie = request.cookies.get('cart')?.value;
        const cart: CartItem[] = cartCookie ? JSON.parse(cartCookie) : [];

        // Extract product IDs
        const productIds = cart.map((item) => item.productId);

        // Calculate total items in cart
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

        return NextResponse.json(
            {
                message: 'Cart products get',
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

interface CartItem {
    productId: string;
    quantity: number;
}
