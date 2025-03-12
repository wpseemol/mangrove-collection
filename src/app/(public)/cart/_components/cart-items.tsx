'use client';
import { Card, CardHeader } from '@/components/ui/card';
import { useEffect } from 'react';

import { useCartProducts } from '@/hooks';
import CartLoading from './cart-loading';
import { CartProductTable } from './cart-product-table';

export default function CartItems() {
    const { loading, setLoading, cartProducts, setCartProducts } =
        useCartProducts();

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
                        setCartProducts(responseData.data);
                    }
                }
            } catch (error) {
                console.error('Cart Get product:', error);
            } finally {
                setLoading(false);
            }
        }

        getCartProduct();
    }, []);

    return (
        <>
            <section className={`md:my-10 my-5 w-full flex gap-2`}>
                <Card
                    className={`${
                        false ? 'w-[70%]' : 'w-full'
                    } p-5 duration-300`}>
                    <CardHeader className="p-0 font-medium">
                        Shopping Cart
                    </CardHeader>

                    {loading ? (
                        <CartLoading />
                    ) : (
                        cartProducts && <CartProductTable data={cartProducts} />
                    )}
                </Card>
            </section>
            {/* <CartEmptyComponent /> */}
        </>
    );
}

interface CartProductsType {
    quantity: number;
    price: number;
    slug: string;
    id: string;
    currency: string;
    name: string;
    thumbnail: string;
}
