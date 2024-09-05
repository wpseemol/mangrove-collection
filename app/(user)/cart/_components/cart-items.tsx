'use client';

import { Card, CardHeader } from '@/components/ui/card';
import { useCart } from '@/hooks';
import CartProductTable from './cart-product-table';

export default function CartItems() {
    const { cart } = useCart();

    console.log(cart);

    return (
        cart.cartItems && (
            <Card className="p-5 md:my-10 my-5">
                <CardHeader className="text-2xl ">Shopping Cart</CardHeader>
                {cart.loading ? (
                    <div>
                        <p>'loading...'</p>
                    </div>
                ) : (
                    <>
                        <CartProductTable />
                    </>
                )}
            </Card>
        )
    );
}
