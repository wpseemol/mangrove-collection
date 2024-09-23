'use client';

import { Button } from '@/components/ui/button';
import { useCart } from '@/hooks';
import { localStorageMultiDelete } from '@/utils/localstorage';

export default function CartMultiDeleted() {
    const { setCart, orderSummary, setOrderSummary, setRowSelection } =
        useCart();

    function handelMultiDeleted() {
        if (orderSummary && orderSummary.length > 0) {
            const deletedSlugs = orderSummary.map((item) => item.slug);

            const isDelete = localStorageMultiDelete(deletedSlugs);

            if (isDelete) {
                // cart data set
                setCart((prev) => {
                    const cartProducts =
                        prev.cartProducts?.filter(
                            (item) => !isDelete.deleteItem.includes(item.slug)
                        ) || null;
                    const obj = {
                        ...prev,
                        cartItems: isDelete.afterDeleteItem,
                        cartCount: isDelete.afterDeleteItemCount,
                        cartProducts,
                    };

                    return obj;
                });

                // cart order summary set
                setOrderSummary((prev) => {
                    const afterDelete =
                        prev?.filter((item) =>
                            isDelete.afterDeleteItem?.includes(item.slug)
                        ) || null;
                    return afterDelete;
                });

                // table select reset
                setRowSelection({});
            }
        }
    }

    return (
        orderSummary &&
        orderSummary.length > 0 && (
            <Button onClick={handelMultiDeleted}>
                Deleted (
                {orderSummary.length > 1
                    ? orderSummary.length + ' items'
                    : orderSummary.length + ' item'}
                )
            </Button>
        )
    );
}
