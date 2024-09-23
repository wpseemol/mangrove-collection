'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks';
import { CartProductType, OrderSummary } from '@/types/cart';

export default function CartOrderSummary() {
    const { cart, orderSummary } = useCart();

    const orderProducts = orderSummary as OrderSummary[];

    const orderProduct = cart.cartProducts?.filter((product) =>
        orderProducts.some((item) => item.slug === product.slug)
    ) as CartProductType[];

    const totalPrice = orderProduct.reduce((acc, curr) => {
        const multiplyPrice = curr.price * curr.quantity;

        return acc + multiplyPrice;
    }, 0);

    const totalCount = orderProduct.reduce((acc, curr) => {
        const count = curr.quantity + acc;
        return count;
    }, 0);

    return orderSummary && orderSummary.length > 0 ? (
        <Card className={`p-5 h-fit`}>
            <CardHeader className="p-0 font-medium">Order Summary</CardHeader>
            <CardContent className="px-0">
                {/* cart price section */}
                <div className="flex justify-between items-start">
                    <p>
                        Subtotal (
                        {orderSummary.length > 1
                            ? orderSummary.length + ' items'
                            : orderSummary.length + ' item'}
                        )
                    </p>{' '}
                    <span>{totalPrice.toFixed(2)}&#2547;</span>
                </div>
                {/* cart price section */}
            </CardContent>

            <Button className="w-full">Proceed to Pay {totalCount}</Button>
        </Card>
    ) : (
        <Card>
            <CardContent>No data found.</CardContent>
        </Card>
    );
}
