import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'your-secret-key'; // Use a secure key

export async function DELETE(request: NextRequest) {
    try {
        const body = (await request.json()) as PurchaseDeleteItem;

        if (!body?.productId) {
            return NextResponse.json(
                {
                    message: 'Product ID are required.',
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

        purchase = purchase.filter((item) => item.productId !== body.productId);

        // Store encrypted cart in cookies
        const response = NextResponse.json(
            {
                message: 'Product deleted succes',
                success: true,
                date: purchase,
            },
            { status: 200 }
        );

        if (purchase.length > 0) {
            // Encrypt the updated cart data with JWT
            const token = jwt.sign({ purchase }, SECRET_KEY, {
                expiresIn: '1y',
            }); // Expires in 1 year

            response.cookies.set('purchase', token, {
                httpOnly: true,
                secure: true, // Ensure cookies are sent over HTTPS
                maxAge: 31536000, // 1 year in seconds
                path: '/', // Available across the entire site
            });
        } else {
            response.cookies.delete('purchase');
        }

        return response;
    } catch (error: unknown) {
        console.log('error:', error);
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

interface PurchaseDeleteItem {
    productId: string;
}

interface PurchaseItem {
    productId: string;
    quantity: number;
}
