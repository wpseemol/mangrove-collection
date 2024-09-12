import { connectMongoDB } from '@/db/connections/mongoose-connect';
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
            'slug thumbnail name category price currency '
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

interface PriceType {
    variantId: string;
    price: number;
    select: boolean;
}
