'use client';

import QuantityButton from '@/components/quantity-button';
import { useCart } from '@/hooks';
import { CartProductType, CartTableRowType } from '@/types/cart';

export default function CartQuantity({ row }: CartTableRowType) {
    const { setCart } = useCart();

    return (
        <section className="flex justify-center">
            <QuantityButton
                quantityValue={(value: number) => {
                    setCart((prev) => {
                        // quantity item set then return
                        const cartProducts = prev.cartProducts?.map((item) => {
                            if (item.id === row.original.id) {
                                return {
                                    ...item,
                                    quantity: value,
                                };
                            } else {
                                return item;
                            }
                        }) as CartProductType[];
                        // quantity item set then return

                        return {
                            ...prev,
                            cartProducts,
                        };
                    });
                }}
            />
        </section>
    );
}
