import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { Cart } from '@/lib/schemas/mongoose/cart';
import { Product } from '@/lib/schemas/mongoose/product';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const searchPramsString = searchParams.get('cart-items');
        const cartItems = searchPramsString?.split('|');

        // Check if cartItems is valid before proceeding
        if (!cartItems || cartItems.length === 0) {
            return NextResponse.json(
                { message: 'No cart items provided.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const response = await Product.find(
            {
                slug: { $in: cartItems },
            },
            'thumbnail name category price currency'
        )
            .populate({
                path: 'category',
                select: 'name slug',
            })
            .lean();

        const cartProducts =
            response.length > 0
                ? response.map((product) => {
                      const selectedPrice: PriceType = product.price.find(
                          (price: PriceType) => price.select
                      );

                      const { _id, ...withOut_id } = product;

                      return {
                          id: product._id,
                          ...withOut_id,
                          price: selectedPrice.price,
                          quantity: 1,
                      };
                  })
                : null;

        return NextResponse.json(
            {
                message: 'Cart data successful send.',
                cartProducts,
            },
            { status: 200 }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        if (!(body && body.productId && body.userId)) {
            return NextResponse.json(
                { message: 'ProductId is Required add cart product.' },
                { status: 400 }
            );
        }

        await connectMongoDB();

        const userId = body.userId;
        const productId = body.productId;

        // if(body.isLogin){

        // }

        const addCart = await Cart.create({ userId, productId });

        return NextResponse.json(
            {
                message: 'Successful product add to cart.',
                addCart,
            },
            {
                status: 201,
            }
        );
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal server error', error },
            { status: 500 }
        );
    }
}

interface WrongCardItemsType {
    id: string;
    message: string;
    type: string;
}

interface PriceType {
    variantId: string;
    price: number;
    select: boolean;
}
