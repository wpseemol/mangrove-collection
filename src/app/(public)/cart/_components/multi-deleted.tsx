'use client';

import { Button } from '@/components/ui/button';
import { useCart, useCartProducts } from '@/hooks';
import Swal from 'sweetalert2';

export default function MultiDeleted() {
    const { cartSelectedProducts, setCartProducts } = useCartProducts();
    const { setCart } = useCart();

    async function handelMultiDeleted() {
        const deletedItemsIds = (cartSelectedProducts ?? []).map(
            (item) => item.id
        );

        Swal.fire({
            title: 'Are you sure?',
            text: `You want to be deleted ${deletedItemsIds.length} items.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!',
        }).then(async (result) => {
            if (result.isConfirmed) {
                Swal.fire({
                    title: 'Deleted!',
                    text: 'Your file has been deleted.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 1500,
                });

                setCartProducts((prevData) => {
                    if (!prevData) return null;
                    const removeProduct = prevData.filter(
                        (item) => !deletedItemsIds.includes(item.id)
                    );

                    if (removeProduct.length > 0) {
                        return removeProduct;
                    }
                    return null;
                });

                setCart((prev) => {
                    const removeProduct = prev.cartProductIds.filter(
                        (item) => !deletedItemsIds.includes(item)
                    );

                    const cartCount = removeProduct.length;
                    return {
                        cartCount,
                        cartProductIds: removeProduct,
                    };
                });

                try {
                    await fetch(`/api/v1/cart/deleted`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(deletedItemsIds),
                    });
                } catch (error) {
                    console.error('Cart DELETE error:', error);
                }
            }
        });
    }

    return (
        cartSelectedProducts && (
            <Button onClick={handelMultiDeleted} className="text-white">
                Deleted (
                {cartSelectedProducts.length > 1
                    ? cartSelectedProducts.length + ' items'
                    : cartSelectedProducts.length + ' item'}
                )
            </Button>
        )
    );
}
