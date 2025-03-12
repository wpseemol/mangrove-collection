import { connectMongoDB } from '@/db/connections';
import { Product } from '@/lib/schemas/mongoose/product';
import { replaceMongoIds } from '@/utils/replace-mongo-Ids';
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

        await connectMongoDB();

        const showColumns = 'name thumbnail slug price currency';
        const productResponse = await Product.find(
            {
                _id: { $in: productIds },
            },
            showColumns
        ).lean();

        const products = replaceMongoIds(productResponse) as ProductType[];

        const cartProducts = products.map((item) => {
            const displayPrice = item.price.find(
                (item: PriceType) => item.select
            );

            const cartProduct = cart.find(
                (purchaseItem) => purchaseItem.productId === item.id.toString()
            );
            if (cartProduct) {
                return {
                    id: item.id.toString(),
                    name: item.name,
                    slug: item.slug,
                    thumbnail: item.thumbnail,
                    currency: item.currency,
                    price: displayPrice?.price || 0,
                    quantity: cartProduct.quantity,
                };
            }

            return {
                id: item.id.toString(),
                name: item.name,
                slug: item.slug,
                currency: item.currency,
                thumbnail: item.thumbnail,
                price: displayPrice?.price || 0,
                quantity: 1,
            };
        }) as CartProductsType[];

        return NextResponse.json(
            {
                message: 'Cart retrieved successfully.',
                success: true,
                data: cartProducts,
                cart,
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

interface ProductType {
    id: string | number;
    name: string;
    slug: string;
    currency: string;
    thumbnail: string;
    price: PriceType[];
}

interface PriceType {
    /**
     * Identifier for the variant.
     */
    variantId: string;

    /**
     * Price for the variant.
     */
    price: number;

    /**
     * Indicates if the variant is selected.
     */
    select: boolean;
}

interface CartProductsType {
    quantity: number;
    price: number;
    slug: string;
    id: string;
    currency: string;
    name: string;
    thumbnail: string;
}
