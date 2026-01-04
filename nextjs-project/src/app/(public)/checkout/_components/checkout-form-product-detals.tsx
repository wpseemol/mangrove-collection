"use client";

import { CurrencyIcon } from "@/components/currency-icon";
import { purchaseDataDelete } from "@/lib/actions/purchase";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { PurchaseProductsType } from "@/types/purchase";
import { Trash2, Truck, Package } from "lucide-react";
import Image from "next/image";

interface FormShippingSectionProps {
    form: CheckoutFormType;
    buyProductData: PurchaseProductsType[];
    onRemoveProduct?: (productId: string) => void;
}

export default function CompactProductDetails({
    form,
    buyProductData,
}: FormShippingSectionProps) {
    const {
        register,
        formState: { errors },
        setValue,
        watch,
    } = form;

    const shippingCostId = watch("shippingCostId");

    const handleShippingCostSelect = (shippingId: string) => {
        setValue("shippingCostId", shippingId, { shouldValidate: true });
    };

    const handleRemoveProduct = async (id: string) => {
        // Call your actual remove function here
        await purchaseDataDelete(id);
    };

    return (
        <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
            <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white mb-6">
                <Truck className="w-5 h-5" />
                Product & Delivery Details
            </h2>

            {/* Products List */}
            <div className="space-y-4">
                {buyProductData.map((product) => (
                    <div
                        key={product.id}
                        className="rounded-lg border border-neutral-200 dark:border-neutral-700 overflow-hidden"
                    >
                        {/* Product Header */}
                        <div className="bg-neutral-50 dark:bg-neutral-900 p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="relative w-12 h-12 rounded overflow-hidden">
                                        <Image
                                            src={product.thumbnail}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            sizes="48px"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="font-medium text-primary dark:text-white">
                                            {product.name}
                                        </h3>
                                        <p className="text-sm text-neutral-600 dark:text-neutral-400">
                                            Quantity: {product.quantity} ×{" "}
                                            <CurrencyIcon
                                                currency={product.currency}
                                            />{" "}
                                            {product.price.toFixed(2)}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="font-bold text-primary dark:text-white">
                                        <CurrencyIcon
                                            currency={product.currency}
                                        />{" "}
                                        {(
                                            product.price * product.quantity
                                        ).toFixed(2)}
                                    </p>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            handleRemoveProduct(product.id)
                                        }
                                        className="mt-1 text-xs text-neutral-400 hover:text-red-500 flex items-center gap-1"
                                    >
                                        <Trash2 className="w-3 h-3" />
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Delivery Options */}
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Package className="w-4 h-4 text-primary dark:text-white" />
                                <h4 className="text-sm font-medium text-primary dark:text-white">
                                    Select Shipping Method
                                </h4>
                            </div>

                            <input
                                type="hidden"
                                {...register("shippingCostId")}
                            />

                            {errors.shippingCostId && (
                                <p className="mb-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                                    {errors.shippingCostId.message}
                                </p>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {product.shippingCost.map((option) => (
                                    <label
                                        key={option.shippingId}
                                        className="relative cursor-pointer"
                                    >
                                        <input
                                            {...register("shippingCostId")}
                                            type="radio"
                                            value={option.shippingId}
                                            checked={
                                                shippingCostId ===
                                                option.shippingId
                                            }
                                            onChange={() =>
                                                handleShippingCostSelect(
                                                    option.shippingId
                                                )
                                            }
                                            className="sr-only"
                                        />
                                        <div
                                            className={`p-3 rounded-lg border transition-all ${
                                                shippingCostId ===
                                                option.shippingId
                                                    ? "border-primary bg-primary/5 dark:bg-primary/20"
                                                    : "border-neutral-200 dark:border-neutral-700 hover:border-primary/50"
                                            }`}
                                        >
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <p className="font-medium text-primary dark:text-white">
                                                        {option.title}
                                                    </p>
                                                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                                                        {
                                                            option.shortDescription
                                                        }
                                                    </p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-bold text-primary dark:text-white">
                                                        ৳{option.price}
                                                    </p>
                                                    {option.shortDescription && (
                                                        <p className="text-xs text-neutral-500">
                                                            {
                                                                option.shortDescription
                                                            }{" "}
                                                            days
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
