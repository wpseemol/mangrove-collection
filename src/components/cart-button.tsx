'use client';
import { useCart } from '@/hooks';
import { Button } from './ui/button';

export default function CartButton({
    productId,
}: {
    productId: string | number;
}) {
    const { cart, setCart } = useCart();

    const isAlreadyCard: boolean = cart.cartProductIds.includes(
        productId.toString()
    );

    async function handleCard() {
        const cartItem: CartItem = {
            productId: productId.toString(),
            quantity: 1,
        };

        const response = await fetch(`/api/v1/cart/set`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(cartItem),
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.success) {
                setCart({
                    cartCount: responseData.totalItems,
                    cartProductIds: responseData.productIds,
                });
            }
        }
    }

    return (
        <Button
            onClick={() => {
                if (!isAlreadyCard) handleCard();
            }}
            disabled={isAlreadyCard}
            variant="default"
            size="sm"
            className="text-neutral-100 hover:bg-primary-foreground">
            <span className="hidden sm:inline">
                {isAlreadyCard ? 'Added' : 'Add to Cart'}
            </span>
            <span className="sm:hidden">
                {isAlreadyCard ? 'Added' : 'Cart'}
            </span>
        </Button>
    );
}

interface CartItem {
    productId: string;
    quantity: number;
}
