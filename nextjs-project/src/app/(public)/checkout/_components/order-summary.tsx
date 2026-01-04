"use client";
import { CurrencyIcon } from "@/components/currency-icon";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { PurchaseProductsType } from "@/types/purchase";
import Image from "next/image";
import Link from "next/link";

interface OrderSummaryProps {
    form: CheckoutFormType;
    buyProductData: PurchaseProductsType[];
}

export default function OrderSummary({
    form,
    buyProductData,
}: OrderSummaryProps) {
    const {
        register,
        formState: { errors },
    } = form;

    const productPrice = buyProductData.map(
        (product) => product.quantity * product.price
    );
    const productDeliveryFee = buyProductData.map(
        (product) =>
            product.shippingCost.find(
                (psc) => psc.shippingId === form.getValues("shippingCostId")
            )?.price || 0
    );

    const subTotal = productPrice.reduce((total, price) => total + price, 0);
    const totalDeliveryFee = productDeliveryFee.reduce(
        (total, price) => total + price,
        0
    );

    return (
        <div className="lg:w-[calc(100%/3-16px)] flex-shrink-0 h-fit sticky top-[5rem]">
            <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="text-lg font-bold text-primary dark:text-white mb-6">
                    Order Summary
                </h2>

                {buyProductData.map((product) => (
                    <div
                        key={product.id}
                        className="mb-6 space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar"
                    >
                        <div className="flex gap-4">
                            <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-neutral-200 dark:border-neutral-700">
                                <Image
                                    className="h-full w-full object-cover object-center"
                                    data-alt={product.name}
                                    alt={product.name}
                                    src={product.thumbnail}
                                    width={50}
                                    height={50}
                                />
                            </div>
                            <div className="flex flex-1 flex-col justify-center">
                                <div className="flex justify-between text-base font-medium text-primary dark:text-white">
                                    <Link href={`/products/${product.slug}`}>
                                        <h3 className="line-clamp-1">
                                            {product.name}
                                        </h3>
                                    </Link>
                                    <p className="ml-4">
                                        {" "}
                                        <CurrencyIcon
                                            currency={product.currency}
                                        />{" "}
                                        {product.price.toFixed(2)}
                                    </p>
                                </div>
                                <p className="mt-1 text-sm text-neutral-500">
                                    Quantity: {product.quantity} ×{" "}
                                    <CurrencyIcon currency={product.currency} />{" "}
                                    {product.price.toFixed(2)}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}

                <div className="border-t border-neutral-200 pt-4 space-y-2 dark:border-neutral-700">
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Subtotal</p>
                        <p className="font-medium text-primary dark:text-white">
                            <CurrencyIcon
                                currency={buyProductData[0].currency}
                            />{" "}
                            {subTotal.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Delivery Fee</p>
                        <p className="font-medium text-primary dark:text-white">
                            <CurrencyIcon
                                currency={buyProductData[0].currency}
                            />{" "}
                            {totalDeliveryFee.toFixed(2)}
                        </p>
                    </div>
                    <div className="flex justify-between text-sm text-neutral-600 dark:text-neutral-400">
                        <p>Discount</p>
                        <p className="font-medium text-green-600">- ৳ 0</p>
                    </div>
                </div>
                <div className="mt-6 border-t border-neutral-200 pt-4 dark:border-neutral-700">
                    <div className="flex items-end justify-between">
                        <p className="text-base font-medium text-primary dark:text-white">
                            Total Amount
                        </p>
                        <p className="text-2xl font-bold text-primary dark:text-white">
                            <CurrencyIcon
                                currency={buyProductData[0].currency}
                            />{" "}
                            {(subTotal + totalDeliveryFee).toFixed(2)}
                        </p>
                    </div>
                    <p className="text-right text-xs text-neutral-400 mt-1">
                        Including VAT
                    </p>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="mt-6 flex items-start gap-2">
                    <div className="flex h-5 items-center">
                        <input
                            {...register("termsAccepted")}
                            className="h-4 w-4 rounded border-neutral-300 text-primary focus:ring-primary dark:border-neutral-600 dark:bg-neutral-800 dark:ring-offset-neutral-900"
                            id="terms"
                            type="checkbox"
                        />
                    </div>
                    <label
                        className="text-sm text-neutral-500 dark:text-neutral-400 cursor-pointer"
                        htmlFor="terms"
                    >
                        I agree to the{" "}
                        <a
                            className="font-medium text-primary underline underline-offset-2 dark:text-white hover:text-primary/80"
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a
                            className="font-medium text-primary underline underline-offset-2 dark:text-white hover:text-primary/80"
                            href="#"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Privacy Policy
                        </a>
                        .
                    </label>
                </div>
                {errors.termsAccepted && (
                    <p className="mt-2 text-sm text-red-500">
                        {errors.termsAccepted.message}
                    </p>
                )}

                {/* Submit Button */}
                <button
                    className="mt-6 w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed dark:bg-white dark:text-primary dark:hover:bg-white/90 transition-colors"
                    type="submit"
                >
                    <span>Place Order</span>
                    <span className="material-symbols-outlined text-[20px]">
                        arrow_forward
                    </span>
                </button>
                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-neutral-400">
                    <span className="material-symbols-outlined text-[16px]">
                        lock
                    </span>
                    <p>Secure SSL Encrypted Checkout</p>
                </div>
            </div>
        </div>
    );
}
