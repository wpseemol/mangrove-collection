import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function PATCH(request: NextRequest) {
    try {
        const body = (await request.json()) as PurchaseItem;

        if (!body?.productId || !body?.quantity) {
            return NextResponse.json(
                {
                    message: 'Product ID and quantity are required.',
                    success: false,
                },
                { status: 400 }
            );
        }

        const purchaseCookie = request.cookies.get('purchase')?.value;
        let purchase: PurchaseItem[] = [];

        // Decrypt the cart data if it exists
        if (purchaseCookie) {
            try {
                const decoded = jwt.verify(purchaseCookie, SECRET_KEY) as {
                    purchase: PurchaseItem[];
                };

                purchase = decoded.purchase;
            } catch (error) {
                console.error('Invalid JWT:', error);
                return NextResponse.json(
                    { message: 'Invalid purchase data in JWT.' },
                    { status: 400 }
                );
            }
        }

        // Update cart
        const existingItemIndex = purchase.findIndex(
            (item) => item.productId === body.productId
        );
        if (existingItemIndex !== -1) {
            purchase[existingItemIndex].quantity = body.quantity;
        } else {
            purchase.push(body);
        }

        // Encrypt the updated cart data with JWT
        const token = jwt.sign({ purchase }, SECRET_KEY, {
            expiresIn: '1y',
        }); // Expires in 1 year

        // Store encrypted cart in cookies
        const response = NextResponse.json(
            {
                message: 'Cart updated successfully.',
                success: true,
                date: purchase,
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
