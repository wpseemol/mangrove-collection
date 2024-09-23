'use client';
import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';
import { CartProductType, OrderSummary } from '@/types/cart';
import { localStorageItemDelete } from '@/utils/localstorage';
import { Row } from '@tanstack/react-table';
import { useEffect } from 'react';
import { MdDelete } from 'react-icons/md';

export default function TotalOrDeleted({ row }: { row: Row<CartProductType> }) {
    const price: number = row.getValue('price');
    const currency = row.original.currency;
    const quantity = row.original.quantity;

    let totalPrice = price * quantity;

    let totalPriceComponent = <span>{totalPrice.toFixed(2)}</span>;

    if (currency === 'taka') {
        totalPriceComponent = (
            <>
                <span>{totalPrice.toFixed(2)}&#2547;</span>
            </>
        );
    } else if (currency === 'dollar') {
        totalPriceComponent = (
            <>
                <span>{totalPrice.toFixed(2)}&#36;</span>
            </>
        );
    }

    return (
        <div className="flex justify-center items-center gap-x-3">
            {totalPriceComponent} <span className="text-xl">|</span>{' '}
            <CartItemDeleted row={row} />{' '}
        </div>
    );
}

function CartItemDeleted({ row }: { row: Row<CartProductType> }) {
    const { setCart, setOrderSummary } = useCart();

    async function handelDeleted(productSlug: string) {
        setCart((prev) => ({ ...prev, cartCountLoading: true }));
        try {
            const isDeleted = localStorageItemDelete(productSlug);

            if (isDeleted) {
                setCart((prev) => {
                    const cartProducts = prev.cartProducts?.filter(
                        (item) => item.slug !== isDeleted.deletedProductSlug
                    ) as CartProductType[];

                    return {
                        ...prev,
                        cartItems: isDeleted.cartItemsArray,
                        cartCount: isDeleted.cartCountLength,
                        cartProducts,
                    };
                });

                setOrderSummary((prev) => {
                    const orderSummary = prev?.filter(
                        (item) => item.slug !== isDeleted.deletedProductSlug
                    ) as OrderSummary[];
                    return orderSummary;
                });
            }
        } catch (error) {
        } finally {
            setCart((prev) => ({ ...prev, cartCountLoading: false }));
        }
    }

    useEffect(() => {
        if (row.original.quantity === 0) {
            handelDeleted(row.original.slug);
        }
    }, [row.original.quantity]);

    return (
        <Button
            onClick={() => handelDeleted(row.original.slug)}
            variant={'ghost'}
            className="p-0 text-lg">
            <MdDelete />
        </Button>
    );
}
