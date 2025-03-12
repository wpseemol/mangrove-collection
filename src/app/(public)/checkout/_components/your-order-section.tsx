'use client';

import { CurrencyIcon } from '@/components/currency-icon';
import debounce from '@/utils/debounce';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';

export default function YourOrderSection() {
    const router = useRouter();

    const [loading, setLoading] = useState<boolean>(true);

    const [purcheseProducts, setPurcheseProducts] = useState<
        PurchaseProductsType[]
    >([]);

    const SHIPPING_CHARGE = 5; // Flat shipping charge

    const updateQuantity = (id: number, quantity: number) => {
        setPurcheseProducts((prevCart) =>
            prevCart.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    const removeItem = (id: number) => {
        setPurcheseProducts((prevCart) =>
            prevCart.filter((item) => item.id !== id)
        );
    };

    const subtotal = purcheseProducts.reduce(
        (sum, item) => sum + item.price * (item.quantity ? item.quantity : 1),
        0
    );
    const total =
        subtotal + (purcheseProducts.length > 0 ? SHIPPING_CHARGE : 0);

    /**
     * set debounce function
     */
    const debouncedUpdateQuantity = debounce(
        async (id: number | string, quantity: number) => {
            updateQuantity(id, quantity);

            await fetch(`/api/v1/purchase/patch`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ productId: id, quantity: quantity }),
            });
        },
        350
    );

    useEffect(() => {
        async function getPurchaseFetch() {
            setLoading(true);
            try {
                const response = await fetch(`/api/v1/purchase/get`);

                if (response.ok) {
                    const responseData = await response.json();

                    if (responseData.success) {
                        setPurcheseProducts(responseData.data);
                    } else {
                        Swal.fire({
                            icon: 'info',
                            title: 'You have not product sellection.',
                            showConfirmButton: false,
                            timer: 1500,
                        }).then((result) => {
                            if (result.dismiss === Swal.DismissReason.timer) {
                                router.push('/');
                            }
                        });
                    }
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'You have not product sellection.',
                        showConfirmButton: false,
                        timer: 1500,
                    }).then((result) => {
                        if (result.dismiss === Swal.DismissReason.timer) {
                            router.push('/');
                        }
                    });
                }
            } catch (error) {
                console.log(error);
                Swal.fire({
                    icon: 'info',
                    title: 'You have not product sellection.',
                    showConfirmButton: false,
                    timer: 1500,
                }).then((result) => {
                    if (result.dismiss === Swal.DismissReason.timer) {
                        router.push('/');
                    }
                });
            } finally {
                setLoading(false);
            }
        }
        getPurchaseFetch();
    }, [router]);

    console.log(purcheseProducts);

    return (
        <div className="  md:py-8 py-4 pb-10 bg-white shadow-xl md:px-5 px-2 border-l border-green-300">
            <h3 className="text-xl font-semibold text-green-700 mb-4 text-center">
                Your Order
            </h3>

            {loading ? (
                <div className="flex justify-center items-center">
                    <p>Loading...</p>
                </div>
            ) : (
                <>
                    {purcheseProducts.length > 0 ? (
                        purcheseProducts.map((product) => {
                            currency = product.currency;

                            return (
                                <div
                                    key={product.id}
                                    className="flex items-center justify-between border-b border-green-200 py-3 last:border-none">
                                    <div className="flex items-center gap-4">
                                        <Image
                                            src={product.thumbnail}
                                            alt={product.name}
                                            width={50}
                                            height={50}
                                            className="rounded-md border border-green-400"
                                        />
                                        <div>
                                            <Link
                                                href={`/products/${product.slug}`}>
                                                <p className="font-medium text-green-700">
                                                    {product.name}
                                                </p>
                                            </Link>
                                            <p className="text-sm text-gray-600">
                                                {product.price}
                                                <CurrencyIcon
                                                    currency={product.currency}
                                                />
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="number"
                                            min="1"
                                            value={product.quantity}
                                            onChange={(e) => {
                                                const value =
                                                    parseInt(e.target.value) ||
                                                    1;
                                                debouncedUpdateQuantity(
                                                    product.id,
                                                    value
                                                );
                                            }}
                                            className="w-16 p-1 border rounded text-center border-green-400 focus:ring-green-500"
                                        />
                                        <p className="font-medium text-green-700">
                                            {product.price * product.quantity}
                                            <CurrencyIcon
                                                currency={product.currency}
                                            />
                                        </p>
                                        <button
                                            onClick={() =>
                                                removeItem(product.id)
                                            }
                                            className="text-red-500 hover:text-red-700 transition duration-200">
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div>
                            <p className="text-center">
                                No products found to buy.
                            </p>
                        </div>
                    )}

                    {/* Summary Section */}
                    {purcheseProducts.length > 0 ? (
                        <>
                            <div className="flex justify-end py-4">
                                <p className="text-md text-gray-700 pr-5">
                                    Shipping:{' '}
                                    <span className="font-semibold text-green-700">
                                        {purcheseProducts.length > 0
                                            ? SHIPPING_CHARGE
                                            : 0}
                                        <CurrencyIcon currency={currency} />
                                    </span>
                                </p>
                            </div>
                            <div className=" border-t border-green-300 pt-4 text-right">
                                <p className="text-md text-gray-700 pr-5">
                                    Subtotal:{' '}
                                    <span className="font-semibold text-green-700">
                                        {subtotal}{' '}
                                        <CurrencyIcon currency={currency} />
                                    </span>
                                </p>

                                <p className="text-lg font-bold mt-2 text-green-800 pr-5">
                                    Total:{' '}
                                    <span className="text-green-600">
                                        {total}
                                        <CurrencyIcon currency={currency} />
                                    </span>
                                </p>
                            </div>
                        </>
                    ) : (
                        ''
                    )}
                </>
            )}
        </div>
    );
}

let currency: string = '';

interface PurchaseProductsType {
    id: string | number;
    name: string;
    thumbnail: string;
    slug: string;
    currency: string;
    price: number;
    quantity: number;
}
