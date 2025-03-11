'use client';
import { usePurchase } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export default function PurchaseButton({ productId }: { productId: string }) {
    const router = useRouter();

    const { setBuyProducts } = usePurchase();
    function handlePurchase() {
        setBuyProducts([{ productId, quantity: 1 }]);
        console.log('parchus productId:', productId);

        router.push('/checkout');
    }
    return (
        <Button
            onClick={handlePurchase}
            variant="default"
            size="sm"
            className="text-neutral-100 hover:bg-primary-foreground 
                            group-hover:animate-jump animate-once animate-duration-[3000ms]
                            shadow-xl">
            <span className="hidden sm:inline ">Buy Now</span>
            <span className="sm:hidden">Buy</span>
        </Button>
    );
}
