'use client';

import { Card } from '@/components/ui/card';
import { useCart } from '@/hooks';

export default function CartItems() {
    const { cart } = useCart();

    // console.log(cart);

    return (
        cart.cartItems && (
            <Card className="w-1/2">
                <h1 className="text-7xl mb-10">Welcome to Cart page</h1>
                {cart.loading ? (
                    <div>
                        <p>'loading...'</p>
                    </div>
                ) : (
                    <>
                        <h2 className="text-5xl">
                            cart product has {cart.cartCount}
                        </h2>
                    </>
                )}
            </Card>
        )
    );
}
