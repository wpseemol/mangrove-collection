'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks';
import { useState } from 'react';
import CartProductTable from './cart-product-table';

export default function CartItems() {
    const { cart, orderSummary } = useCart();
    const [isCheckout, setIsCheckout] = useState(false);

    // useEffect(() => {
    //     if (orderSummary && orderSummary.length > 0) setIsCheckout(true);
    // }, [orderSummary]);

    console.log('cart-items:', orderSummary);

    return (
        cart.cartItems && (
            <div className={`  w-full flex gap-2`}>
                <Card
                    className={`${
                        isCheckout ? 'w-2/3 duration-300' : 'w-full'
                    } p-5 md:my-10 my-5 duration-300`}>
                    <CardHeader className="p-0 font-medium">
                        Shopping Cart
                    </CardHeader>
                    {cart.cartProductLoading ? (
                        <div className="flex justify-center items-center min-h-44">
                            <p>loading...</p>
                        </div>
                    ) : (
                        <>
                            <CartProductTable />
                        </>
                    )}

                    {/*  */}
                    {/* <Button>Deleted</Button> */}
                </Card>
                {isCheckout && (
                    <Card
                        className={`${
                            isCheckout ? 'w-1/3' : 'w-0 opacity-0'
                        } p-5 md:my-10 my-5 duration-300`}>
                        <CardHeader className="p-0 font-medium">
                            Checkout section
                        </CardHeader>
                    </Card>
                )}
            </div>
        )
    );
}
