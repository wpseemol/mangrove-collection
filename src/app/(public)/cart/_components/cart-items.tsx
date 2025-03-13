'use client';
import { Card, CardHeader } from '@/components/ui/card';
import { useEffect } from 'react';

import { useCartProducts } from '@/hooks';
import CartEmptyComponent from './cart-empty';
import CartLoading from './cart-loading';
import CartOrderSummary from './cart-order-summary';
import { CartProductTable } from './cart-product-table';
import MultiDeleted from './multi-deleted';

export default function CartItems() {
    const {
        loading,
        setLoading,
        cartProducts,
        setCartProducts,
        cartSelectedPrducts,
    } = useCartProducts();

    useEffect(() => {
        async function getCartProduct() {
            try {
                const response = await fetch('/api/v1/cart/product-details');
                /**
                 * get product section
                 */

                if (response.ok) {
                    const responseData = await response.json();
                    if (responseData.success) {
                        if (responseData.data.length > 0) {
                            setCartProducts(responseData.data);
                        } else {
                            setCartProducts(null);
                        }
                    }
                }
            } catch (error) {
                console.error('Cart Get product:', error);
            } finally {
                setLoading(false);
            }
        }

        getCartProduct();
    }, [setLoading, setCartProducts]);

    console.log('cartSelectedPrducts', cartSelectedPrducts);

    if (!loading && !cartProducts) {
        {
            return <CartEmptyComponent />;
        }
    }
    return (
        <>
            <section
                className={`md:my-10 my-5 w-full flex md:flex-row flex-col gap-2`}>
                <Card
                    className={`${
                        cartSelectedPrducts ? 'md:w-[70%] w-full' : 'w-full'
                    } p-5 duration-300`}>
                    <CardHeader className="p-0 font-medium">
                        Shopping Cart
                    </CardHeader>

                    {loading ? (
                        <CartLoading />
                    ) : (
                        cartProducts && (
                            <>
                                <CartProductTable data={cartProducts} />
                                <MultiDeleted />
                            </>
                        )
                    )}
                </Card>
                {cartSelectedPrducts && (
                    <section
                        className={`${
                            cartSelectedPrducts ? 'md:w-[30%] w-full' : 'w-full'
                        } duration-300 overflow-hidden h-fit sticky top-[6rem]`}>
                        <CartOrderSummary />
                    </section>
                )}
            </section>
        </>
    );
}
