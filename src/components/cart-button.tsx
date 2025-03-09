'use client';
import { cartSetProduct } from '@/server/cart/set';
import { Button } from './ui/button';

export default function CartButton({ productId }: { productId: string }) {
    async function handleCard() {
        console.log('cart product:', productId);

        const cardItem: CartItem = {
            productId,
            quantity: 1,
        };

        await cartSetProduct(cardItem);
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
