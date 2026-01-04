"use client";
import { PAYMENT_METHODS } from "@/db/checkout";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { PurchaseProductsType } from "@/types/purchase";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FormItemProps {
    form: CheckoutFormType;
    buyProductData: PurchaseProductsType[];
}

export default function FormItem({ form, buyProductData }: FormItemProps) {
    const {
        register,
        formState: { errors },
        setValue,
        watch,
    } = form;
    const [phoneNumber, setPhoneNumber] = useState("");

    // Watch form values
    const watchedPhone = watch("phoneNumber");
    const shippingCostId = watch("shippingCostId");
    const paymentMethod = watch("paymentMethod");

    // Handle phone number input changes
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const digits = value.replace(/\D/g, "");

        if (digits.length <= 11) {
            setPhoneNumber(digits);
            setValue("phoneNumber", digits, { shouldValidate: true });
        }
    };

    // Format phone number for display
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return "";
        return `+88 ${phone.replace(/(\d{2})(\d{4})(\d{5})/, "$1 $2 $3")}`;
    };

    // Handle shipping cost selection
    const handleShippingCostSelect = (shippingId: string) => {
        setValue("shippingCostId", shippingId, { shouldValidate: true });
    };

    // Handle payment method selection
    const handlePaymentMethodSelect = (
        method: "bKash" | "rocket" | "nagad" | "cod"
    ) => {
        setValue("paymentMethod", method, { shouldValidate: true });
    };

    return (
        <div className="flex-1 min-w-0 space-y-8">
            <div>
                <h1 className="text-3xl font-extrabold tracking-tight text-primary dark:text-white sm:text-4xl my-2">
                    Checkout
                </h1>
                <p className="text-neutral-500 dark:text-neutral-400">
                    Please fill in your details to complete your order.
                </p>
            </div>

            {/* Contact Information Section */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white mb-6">
                    <span className="material-symbols-outlined text-primary dark:text-white">
                        person
                    </span>
                    Contact Information
                </h2>
                <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block">
                        <span className="text-sm font-medium text-primary dark:text-neutral-200">
                            Phone Number *
                        </span>
                        <div className="relative mt-2">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-neutral-500 dark:text-neutral-400">
                                +88
                            </div>
                            <input
                                {...register("phoneNumber")}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                onFocus={() => {
                                    if (!phoneNumber) {
                                        setPhoneNumber("01");
                                        setValue("phoneNumber", "01", {
                                            shouldValidate: true,
                                        });
                                    }
                                }}
                                className={`pl-12 mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                    errors.phoneNumber
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                }`}
                                placeholder="01XXX XX XX XX"
                                type="text"
                                inputMode="tel"
                                maxLength={11}
                            />
                        </div>
                        {errors.phoneNumber ? (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.phoneNumber.message}
                            </p>
                        ) : watchedPhone ? (
                            <p className="mt-1 text-sm text-neutral-500">
                                Display: {formatPhoneNumber(watchedPhone)}
                            </p>
                        ) : null}
                    </label>
                    <label className="block">
                        <span className="text-sm font-medium text-primary dark:text-neutral-200">
                            Full Name *
                        </span>
                        <input
                            {...register("fullName")}
                            className={`mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.fullName
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : ""
                            }`}
                            placeholder="e.g. John Doe"
                            type="text"
                        />
                        {errors.fullName && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.fullName.message}
                            </p>
                        )}
                    </label>
                </div>
            </section>

            {/* Shipping Address Section */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white mb-6">
                    <span className="material-symbols-outlined text-primary dark:text-white">
                        home_pin
                    </span>
                    Shipping Address
                </h2>
                <div className="space-y-6">
                    <label className="block">
                        <span className="text-sm font-medium text-primary dark:text-neutral-200">
                            Street Address *
                        </span>
                        <textarea
                            {...register("fullAddress")}
                            rows={3}
                            className={`mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                errors.fullAddress
                                    ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                    : ""
                            }`}
                            placeholder="House 123, Road 4, Block B"
                        />
                        {errors.fullAddress && (
                            <p className="mt-1 text-sm text-red-500">
                                {errors.fullAddress.message}
                            </p>
                        )}
                    </label>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-medium text-primary dark:text-neutral-200">
                                District *
                            </span>
                            <select
                                {...register("district")}
                                className={`mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                    errors.district
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                }`}
                            >
                                <option value="">Select District</option>
                                <option value="Dhaka">Dhaka</option>
                                <option value="Chittagong">Chittagong</option>
                                <option value="Sylhet">Sylhet</option>
                                <option value="Khulna">Khulna</option>
                                <option value="Rajshahi">Rajshahi</option>
                                <option value="Barisal">Barisal</option>
                                <option value="Rangpur">Rangpur</option>
                                <option value="Mymensingh">Mymensingh</option>
                                {/* Add more districts as needed */}
                            </select>
                            {errors.district && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.district.message}
                                </p>
                            )}
                        </label>
                        <label className="block">
                            <span className="text-sm font-medium text-primary dark:text-neutral-200">
                                City *
                            </span>
                            <input
                                {...register("city")}
                                className={`mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                    errors.city
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                }`}
                                placeholder="e.g. Gulshan, Mirpur, Uttara"
                                type="text"
                            />
                            {errors.city && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.city.message}
                                </p>
                            )}
                        </label>
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        <label className="block">
                            <span className="text-sm font-medium text-primary dark:text-neutral-200">
                                Postal Code
                            </span>
                            <input
                                {...register("zipCode")}
                                className={`mt-2 block w-full rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                                    errors.zipCode
                                        ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                                        : ""
                                }`}
                                placeholder="1212"
                                type="text"
                                maxLength={6}
                                inputMode="numeric"
                            />
                            {errors.zipCode && (
                                <p className="mt-1 text-sm text-red-500">
                                    {errors.zipCode.message}
                                </p>
                            )}
                        </label>
                    </div>
                </div>
            </section>

            {/* Delivery Method Section */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white mb-6">
                    <span className="material-symbols-outlined text-primary dark:text-white">
                        local_shipping
                    </span>
                    Delivery Method
                </h2>

                {/* Hidden input for form registration */}
                <input type="hidden" {...register("shippingCostId")} />

                {errors.shippingCostId && (
                    <p className="mb-4 text-sm text-red-500">
                        {errors.shippingCostId.message}
                    </p>
                )}

                <div className="space-y-4">
                    {buyProductData.map((product) => (
                        <div key={product.id} className="space-y-3">
                            <h3 className="font-medium text-primary dark:text-white">
                                {product.name}
                            </h3>
                            {product.shippingCost.map((productShippingCost) => (
                                <label
                                    key={productShippingCost.shippingId}
                                    className="group relative block cursor-pointer"
                                    onClick={() =>
                                        handleShippingCostSelect(
                                            productShippingCost.shippingId
                                        )
                                    }
                                >
                                    <input
                                        {...register("shippingCostId")}
                                        className="peer sr-only"
                                        type="radio"
                                        value={productShippingCost.shippingId}
                                        checked={
                                            shippingCostId ===
                                            productShippingCost.shippingId
                                        }
                                        onChange={() =>
                                            handleShippingCostSelect(
                                                productShippingCost.shippingId
                                            )
                                        }
                                    />
                                    <div
                                        className={`custom-radio-border flex items-center justify-between rounded-lg border p-4 transition-all ${
                                            shippingCostId ===
                                            productShippingCost.shippingId
                                                ? "border-primary bg-primary/5 ring-1 ring-primary dark:border-primary dark:bg-primary/20"
                                                : "border-neutral-200 hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600"
                                        }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div
                                                className={`radio-indicator flex size-5 items-center justify-center rounded-full border ${
                                                    shippingCostId ===
                                                    productShippingCost.shippingId
                                                        ? "border-primary bg-primary dark:border-primary"
                                                        : "border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800"
                                                }`}
                                            >
                                                {shippingCostId ===
                                                    productShippingCost.shippingId && (
                                                    <div className="size-2.5 rounded-full bg-primary dark:bg-white"></div>
                                                )}
                                            </div>
                                            <div>
                                                <p className="font-bold text-primary dark:text-white">
                                                    {productShippingCost.title ||
                                                        "Shipping Option"}
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    {productShippingCost.shortDescription ||
                                                        "2-3 business days"}
                                                </p>
                                            </div>
                                        </div>
                                        <p className="font-bold text-primary dark:text-white">
                                            ৳ {productShippingCost.price || 0}
                                        </p>
                                    </div>
                                </label>
                            ))}
                        </div>
                    ))}
                </div>
            </section>

            {/* Payment Method Section */}
            <section className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <h2 className="flex items-center gap-2 text-lg font-bold text-primary dark:text-white mb-6">
                    <span className="material-symbols-outlined text-primary dark:text-white">
                        payments
                    </span>
                    Payment Method
                </h2>

                {/* Hidden input for form registration */}
                <input type="hidden" {...register("paymentMethod")} />

                {errors.paymentMethod && (
                    <p className="mb-4 text-sm text-red-500">
                        {errors.paymentMethod.message}
                    </p>
                )}

                <div className="space-y-4">
                    {PAYMENT_METHODS.map((method) => {
                        const isSelected = paymentMethod === method.id;
                        const bgColor =
                            method.id === "cod"
                                ? "var(--color-primary)"
                                : method.color;
                        const textColor =
                            method.id === "cod"
                                ? "text-primary dark:text-white"
                                : `text-[${method.color}]`;

                        return (
                            <div key={method.id} className="space-y-2">
                                <label
                                    className="cursor-pointer block"
                                    onClick={() =>
                                        handlePaymentMethodSelect(method.id)
                                    }
                                >
                                    <input
                                        {...register("paymentMethod")}
                                        className="peer sr-only"
                                        type="radio"
                                        value={method.id}
                                        checked={isSelected}
                                        onChange={() =>
                                            handlePaymentMethodSelect(method.id)
                                        }
                                    />
                                    <motion.div
                                        initial={false}
                                        animate={{
                                            backgroundColor: isSelected
                                                ? method.id === "cod"
                                                    ? "rgba(var(--color-primary-rgb), 0.05)"
                                                    : `${method.color}0D`
                                                : "transparent",
                                            borderColor: isSelected
                                                ? method.id === "cod"
                                                    ? "var(--color-primary)"
                                                    : method.color
                                                : "rgb(229 231 235)",
                                            scale: isSelected ? 1.01 : 1,
                                        }}
                                        whileHover={{ scale: 1.005 }}
                                        transition={{
                                            duration: 0.2,
                                            ease: "easeOut",
                                        }}
                                        className="flex items-start gap-4 rounded-lg border p-4 transition-all dark:border-neutral-700 dark:hover:bg-neutral-800"
                                    >
                                        <motion.div
                                            className="flex-shrink-0"
                                            animate={{
                                                scale: isSelected ? 1.1 : 1,
                                            }}
                                            transition={{ duration: 0.2 }}
                                        >
                                            <div
                                                className="flex size-10 items-center justify-center rounded-full text-white"
                                                style={{
                                                    backgroundColor: bgColor,
                                                }}
                                            >
                                                <span className="material-symbols-outlined">
                                                    {method.icon}
                                                </span>
                                            </div>
                                        </motion.div>
                                        <div className="flex-1">
                                            <div className="flex items-center justify-between">
                                                <span
                                                    className={`block font-bold mb-1 ${textColor}`}
                                                >
                                                    {method.label}
                                                </span>
                                                {isSelected && (
                                                    <div className="flex items-center gap-1 text-sm">
                                                        <span className="material-symbols-outlined text-green-500 text-lg">
                                                            check_circle
                                                        </span>
                                                        <span className="text-green-600 dark:text-green-400 font-medium">
                                                            Selected
                                                        </span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Always show short description */}
                                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-2">
                                                {method.shortDescription}
                                            </p>

                                            {/* Animated detailed description */}
                                            <AnimatePresence mode="wait">
                                                {isSelected && (
                                                    <motion.div
                                                        key={`${method.id}-details`}
                                                        initial={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            height: "auto",
                                                            transition: {
                                                                delay: 0.1,
                                                            },
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            height: 0,
                                                        }}
                                                        transition={{
                                                            duration: 0.3,
                                                            ease: "easeInOut",
                                                        }}
                                                    >
                                                        <motion.div
                                                            initial={{ y: -10 }}
                                                            animate={{ y: 0 }}
                                                            transition={{
                                                                delay: 0.2,
                                                                duration: 0.2,
                                                            }}
                                                            className="mt-2 p-3 rounded-lg bg-black/5 dark:bg-white/5 border-l-4"
                                                            style={{
                                                                borderLeftColor:
                                                                    bgColor,
                                                            }}
                                                        >
                                                            <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                                                                {
                                                                    method.description
                                                                }
                                                            </p>
                                                        </motion.div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.div>
                                </label>

                                {/* Show payment instructions only when selected and not COD */}
                                <AnimatePresence>
                                    {isSelected && method.infoAlert && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -10 }}
                                            transition={{ duration: 0.3 }}
                                            className="ml-14 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                                        >
                                            <div className="flex items-start gap-2">
                                                <span className="material-symbols-outlined text-blue-500 dark:text-blue-400 text-sm">
                                                    info
                                                </span>
                                                <p className="text-sm text-blue-700 dark:text-blue-300">
                                                    {method.infoAlert}
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>
            </section>
        </div>
    );
}
