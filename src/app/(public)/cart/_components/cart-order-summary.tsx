'use client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useCart, useCartProducts } from '@/hooks';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function CartOrderSummary() {
    const { cartSelectedPrducts, setCartProducts } = useCartProducts();
    const { setCart } = useCart();

    const [loading, setLoading] = useState(false);

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

    async function handelShipping() {
        setLoading(true);
        try {
            /**
             * [{productId:string , quantity: number}]
             */
            const purchaseItems = cartSelectedPrducts.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
            })) as PurchaseItemType[];
            await fetch(`/api/v1/purchase/set`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(purchaseItems),
            });
        } catch (error) {
            console.error('Product bye error:', error);
        }

        const deletedItemsIds = cartSelectedPrducts.map((item) => item.id);

        setCartProducts((prevData) => {
            const removeProduct = prevData.filter(
                (item) => !deletedItemsIds.includes(item.id)
            );

            if (removeProduct.length > 0) {
                return removeProduct;
            }
            return null;
        });

        setCart((prev) => {
            const removeProduct = prev.cartProductIds.filter(
                (item) => !deletedItemsIds.includes(item)
            );

            const cartCount = removeProduct.length;
            return {
                cartCount,
                cartProductIds: removeProduct,
            };
        });

        try {
            await fetch(`/api/v1/cart/deleted`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(deletedItemsIds),
            });
        } catch (error) {
            console.error('Cart DELETE error:', error);
        }

        setLoading(false);

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
                {loading ? 'Waiting...' : `Proceed to Pay (${totalCount})`}
            </Button>
        </Card>
    ) : (
        <Card>
            <CardContent>No data found.</CardContent>
        </Card>
    );
}

interface PurchaseItemType {
    productId: string;
    quantity: number;
}
