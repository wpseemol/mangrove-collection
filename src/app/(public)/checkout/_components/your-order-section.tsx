'use client';

import Image from 'next/image';
import { useState } from 'react';

interface Product {
    id: number;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export default function YourOrderSection() {
    const [cart, setCart] = useState<Product[]>([
        {
            id: 1,
            name: 'Product A',
            price: 20,
            quantity: 1,
            image: '/assets/image/mangrove picture.jpg',
        },
        {
            id: 2,
            name: 'Product B',
            price: 30,
            quantity: 1,
            image: '/assets/image/mangrove picture.jpg',
        },
    ]);

    const SHIPPING_CHARGE = 5; // Flat shipping charge

    const updateQuantity = (id: number, quantity: number) => {
        setCart((prevCart) =>
            prevCart.map((item) =>
                item.id === id
                    ? { ...item, quantity: Math.max(1, quantity) }
                    : item
            )
        );
    };

    const removeItem = (id: number) => {
        setCart((prevCart) => prevCart.filter((item) => item.id !== id));
    };

    const subtotal = cart.reduce(
        (sum, item) => sum + item.price * (item.quantity ? item.quantity : 1),
        0
    );
    const total = subtotal + (cart.length > 0 ? SHIPPING_CHARGE : 0);

    return (
        <div className="  md:py-8 py-4 pb-10 bg-white shadow-xl md:px-5 px-2 border-l border-green-300">
            <h3 className="text-xl font-semibold text-green-700 mb-4 text-center">
                Your Order
            </h3>

            {cart.length > 0 ? (
                cart.map((product) => (
                    <div
                        key={product.id}
                        className="flex items-center justify-between border-b border-green-200 py-3 last:border-none">
                        <div className="flex items-center gap-4">
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={50}
                                height={50}
                                className="rounded-md border border-green-400"
                            />
                            <div>
                                <p className="font-medium text-green-700">
                                    {product.name}
                                </p>
                                <p className="text-sm text-gray-600">
                                    ${product.price}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="number"
                                min="1"
                                value={product.quantity}
                                onChange={(e) =>
                                    updateQuantity(
                                        product.id,
                                        parseInt(e.target.value)
                                    )
                                }
                                className="w-16 p-1 border rounded text-center border-green-400 focus:ring-green-500"
                            />
                            <p className="font-medium text-green-700">
                                ${product.price * product.quantity}
                            </p>
                            <button
                                onClick={() => removeItem(product.id)}
                                className="text-red-500 hover:text-red-700 transition duration-200">
                                ✕
                            </button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-gray-500">Your cart is empty.</p>
            )}

            {/* Summary Section */}
            <div className="flex justify-end py-4">
                <p className="text-md text-gray-700 pr-5">
                    Shipping:{' '}
                    <span className="font-semibold text-green-700">
                        ${cart.length > 0 ? SHIPPING_CHARGE : 0}
                    </span>
                </p>
            </div>
            <div className=" border-t border-green-300 pt-4 text-right">
                <p className="text-md text-gray-700 pr-5">
                    Subtotal:{' '}
                    <span className="font-semibold text-green-700">
                        ${subtotal}
                    </span>
                </p>

                <p className="text-lg font-bold mt-2 text-green-800 pr-5">
                    Total: <span className="text-green-600">${total}</span>
                </p>
            </div>
        </div>
    );
}
