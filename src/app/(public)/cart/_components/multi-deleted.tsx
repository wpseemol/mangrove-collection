'use client';

import { Button } from '@/components/ui/button';
import { useCart, useCartProducts } from '@/hooks';

export default function MultiDeleted() {
    const { cartSelectedPrducts, setCartProducts } = useCartProducts();
    const { setCart } = useCart();

    function handelMultiDeleted() {
        const deletedItemsIds = cartSelectedPrducts.map((item) => item.id);

        console.log('deleted Ids', deletedItemsIds);

        setCartProducts((prevData) => {
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
    }

    return (
        cartSelectedPrducts && (
            <Button onClick={handelMultiDeleted} className="text-white">
                Deleted (
                {cartSelectedPrducts.length > 1
                    ? cartSelectedPrducts.length + ' items'
                    : cartSelectedPrducts.length + ' item'}
                )
            </Button>
        )
    );
}
