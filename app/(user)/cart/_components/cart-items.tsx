'use client';

import { Button } from '@/components/ui/button';
import { Card, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import CartOrderSummary from './cart-order-summary';
import CartProductTable from './cart-product-table';

export default function CartItems() {
    const { cart, orderSummary } = useCart();
    const [isCheckout, setIsCheckout] = useState(false);

    useEffect(() => {
        if (orderSummary && orderSummary.length > 0) {
            setIsCheckout(true);
        }
    }, [orderSummary]);

    return (
        cart.cartItems && (
            <div className={`  w-full flex gap-2`}>
                <Card
                    className={`${
                        orderSummary && orderSummary.length > 0
                            ? 'w-2/3 duration-300'
                            : 'w-full'
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

                    {/* deleted multi items */}
                    {orderSummary && orderSummary.length > 0 && (
                        <Button>
                            Deleted (
                            {orderSummary.length > 1
                                ? orderSummary.length + ' items'
                                : orderSummary.length + ' item'}
                            )
                        </Button>
                    )}
                </Card>
                {isCheckout && (
                    <motion.section
                        initial={{ width: '0' }}
                        animate={{
                            width:
                                orderSummary && orderSummary.length > 0
                                    ? '33.333333%'
                                    : 0,
                        }}
                        transition={{
                            type: 'tween',
                            duration: 0.3,
                            ease: [0.25, 0.1, 0.25, 1], // Custom ease curve for a smooth animation
                        }}
                        onAnimationComplete={() => {
                            if (!(orderSummary && orderSummary.length > 0)) {
                                setIsCheckout(false);
                            }
                        }}
                        className="overflow-hidden">
                        <CartOrderSummary />
                    </motion.section>
                )}
            </div>
        )
    );
}
