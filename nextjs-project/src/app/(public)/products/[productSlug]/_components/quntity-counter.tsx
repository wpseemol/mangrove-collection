'use client';
import { Button } from '@/components/ui/button';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function QuantityCounter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchParamsValeu = parseInt(searchParams.get('quantity') ?? '1', 10);
    const [quantity, setQuantity] = useState<number>(searchParamsValeu);

    const params = new URLSearchParams(searchParams);

    const handleIncrease = () => {
        setQuantity((prev) => prev + 1);

        const quantityValue = quantity + 1;
        params.set('quantity', quantityValue.toString());
        router.push(`?${params.toString()}`, { scroll: false });
    };

    const handleDecrease = () => {
        if (quantity > 1) {
            setQuantity((prev) => prev - 1);

            const quantityValue = quantity - 1;
            params.set('quantity', quantityValue.toString());
            router.push(`?${params.toString()}`, { scroll: false });

            if (quantityValue === 1) {
                params.delete('quantity');
                router.push(`?${params.toString()}`, { scroll: false });
            }
        }
    };

    return (
        <div className="font-medium w-fit flex items-center space-x-4 border-t border-b rounded-lg ">
            <Button
                disabled={!(quantity > 1)}
                onClick={handleDecrease}
                className="">
                <svg
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14"
                    />
                </svg>
            </Button>
            <span>{quantity}</span>

            <Button onClick={handleIncrease} className="">
                <svg
                    className="w-4 h-4 text-white"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    fill="none"
                    viewBox="0 0 24 24">
                    <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M5 12h14m-7 7V5"
                    />
                </svg>
            </Button>
        </div>
    );
}
