'use client';

import CartIconSvg from '@/components/cart-icon-svg';
import CustomLink from '@/components/custom-link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';

export default function CartEmptyComponent() {
    const { cart } = useCart();
    return (
        !cart.cartCount && (
            <section className="flex flex-col items-center justify-center mb-5">
                <CartIconSvg />
                <h2 className="md:text-5xl text-3xl mb-5">
                    Your cart is{' '}
                    <span className="text-primary-foreground">Empty</span>
                </h2>
                <p className="mb-5">
                    Must add items on the cart before you proceed to check out
                </p>
                <Button variant="default" className="text-lg" size="lg">
                    <CustomLink href="/">Return Home</CustomLink>
                </Button>
            </section>
        )
    );
}
