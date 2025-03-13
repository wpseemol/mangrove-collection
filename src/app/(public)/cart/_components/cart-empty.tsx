import CartIconSvg from '@/components/svg/cart-icon-svg';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CartEmptyComponent() {
    return (
        <section className="flex flex-col items-center justify-center my-10">
            <CartIconSvg />
            <h2 className="md:text-5xl text-3xl mb-5">
                Your cart is{' '}
                <span className="text-primary-foreground">Empty</span>
            </h2>
            <p className="mb-5 px-2 md:px-0">
                Must add items on the cart before you proceed to check out
            </p>
            <Button variant="default" className="text-lg text-white" size="lg">
                <Link href="/">Return Home</Link>
            </Button>
        </section>
    );
}
