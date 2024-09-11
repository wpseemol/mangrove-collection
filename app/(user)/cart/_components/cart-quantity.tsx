'use client';

import QuantityButton from '@/components/quantity-button';
import { CartTableRowType } from '@/types/cart';

export default function CartQuantity({ row }: CartTableRowType) {
    return (
        <section className="flex justify-center">
            <QuantityButton
                quantityValue={(value: number) => {
                    row.original.quantity = value;
                }}
            />
        </section>
    );
}
