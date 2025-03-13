'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCartProducts } from '@/hooks';
import { useRouter } from 'next/navigation';

export default function CartOrderSummary() {
    const { cartSelectedPrducts } = useCartProducts();

    const router = useRouter();

    const subTotal = cartSelectedPrducts.reduce((acc, curr) => {
        const multiplyPrice = curr.price * curr.quantity;

        return acc + multiplyPrice;
    }, 0);

    const shippingFee = 0;

    const voucherCode = 0;

    const totalPrice = subTotal + shippingFee + voucherCode;

    const totalCount = cartSelectedPrducts.reduce((acc, curr) => {
        const count = curr.quantity + acc;
        return count;
    }, 0);

    function handelShipping() {
        console.log('order product:', cartSelectedPrducts);

        router.push('/checkout');
    }

    return cartSelectedPrducts ? (
        <Card className={`p-5 h-fit `}>
            <CardHeader className="p-0 font-medium">Order Summary</CardHeader>
            <CardContent className="px-0">
                {/* cart price section */}
                <div className="flex justify-between items-start my-3">
                    <p>
                        Subtotal (
                        {totalCount > 1
                            ? totalCount + ' items'
                            : totalCount + ' item'}
                        )
                    </p>{' '}
                    <span>{subTotal.toFixed(2)}&#2547;</span>
                </div>
                {/* cart price section */}

                <div className="flex justify-between items-start my-3">
                    <p>Shipping Fee</p>{' '}
                    <span>{shippingFee.toFixed(2)}&#2547;</span>
                </div>

                {/* voucher code apply */}
                <div className="flex items-center gap-2 mb-3">
                    <Input type="text" placeholder="Enter Voucher Code" />{' '}
                    <Button className="text-white">APPLY</Button>
                </div>
                {/* voucher code apply */}

                {/* cart price section */}
                <div className="flex justify-between items-start mb-3">
                    <p>Total</p> <span>{totalPrice.toFixed(2)}&#2547;</span>
                </div>
                {/* cart price section */}
            </CardContent>

            <Button
                onClick={() => handelShipping()}
                className="w-full text-white">
                Proceed to Pay ({totalCount})
            </Button>
        </Card>
    ) : (
        <Card>
            <CardContent>No data found.</CardContent>
        </Card>
    );
}
