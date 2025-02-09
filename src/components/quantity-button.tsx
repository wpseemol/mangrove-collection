'use client';
import { Button } from '@/components/ui/button';

export default function QuantityButton({
    quantityValue,
    quantityInitialValue,
}: QuantityButtonType) {
    const handleQuantityChange = (type: 'increase' | 'decrease') => {
        let value: number = quantityInitialValue;

        if (type === 'increase') {
            value = quantityInitialValue + 1;
        } else if (type === 'decrease') {
            value = quantityInitialValue > 0 ? quantityInitialValue - 1 : 0;
        }

        quantityValue(value);
    };

    return (
        <div className="flex items-center w-fit ">
            {/* Decrease Button */}
            <Button
                variant="outline"
                onClick={() => handleQuantityChange('decrease')}>
                <svg
                    className="w-4 h-4 text-gray-800 dark:text-white"
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

            {/* Quantity Display */}
            <div className="text-lg font-medium text-gray-800 border-y w-full px-3 py-1">
                {quantityInitialValue}
            </div>

            {/* Increase Button */}
            <Button
                variant="outline"
                onClick={() => handleQuantityChange('increase')}>
                <svg
                    className="w-4 h-4 text-gray-800 dark:text-white"
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

type QuantityButtonType = {
    quantityValue: (value: number) => void;
    quantityInitialValue: number;
};
