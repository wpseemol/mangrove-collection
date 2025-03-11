'use client';
import { Button } from './ui/button';

export default function CartButton({ productId }: { productId: string }) {
    async function handleCard() {
        const cartItem: CartItem = {
            productId,
            quantity: 1,
        };

        const response = await fetch(`/api/v1/cart/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
        });

        // console.log('cart set product:', response);
        const responseData = await response.json();
        console.log('cart set product:', responseData);
    }

    return (
        <Button
            onClick={handleCard}
            variant="default"
            size="sm"
            className="text-neutral-100 hover:bg-primary-foreground">
            <span className="hidden sm:inline">Add to Cart</span>
            <span className="sm:hidden">Cart</span>
        </Button>
    );
}

interface CartItem {
    productId: string;
    quantity: number;
}
