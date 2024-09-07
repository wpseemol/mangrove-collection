import { connectMongoDB } from '@/db/connections/mongoose-connect';
import { Cart } from '@/lib/schemas/mongoose/cart';
import { Product } from '@/lib/schemas/mongoose/product';
import { Visitor } from '@/lib/schemas/mongoose/visitor';
import mongoose, { ObjectId } from 'mongoose';
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

        // mongodb object Validation
        const validCardItems: string[] = [];
        const wrongCardItems: WrongCardItemsType[] = [];
        cartItems.forEach((Item) => {
            if (mongoose.Types.ObjectId.isValid(Item)) {
                validCardItems.push(Item);
            } else {
                wrongCardItems.push({
                    id: Item,
                    message: 'Invalid ObjectId',
                    type: 'invalid-object-id',
                });
            }
        });
        const notFound = wrongCardItems.length > 0 ? wrongCardItems : null;
        // mongodb object Validation

        await connectMongoDB();

        const response = await Product.find(
            {
                _id: { $in: validCardItems },
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
                      };
                  })
                : null;

        return NextResponse.json(
            {
                message: 'Cart data successful send.',
                cartProducts,
                notFound,
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

        const visitor = await Visitor.findOne({
            visitorId: body.userId,
        }).lean<{ _id: ObjectId }>();
        if (!visitor) {
            return NextResponse.json(
                { message: 'User id is required to add to cart.' },
                { status: 400 }
            );
        }

        const userId = visitor._id;
        const productId = body.productId;

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
