"use client";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { useState } from "react";

interface FormItemProps {
    form: CheckoutFormType;
}

export default function FormItem({ form }: FormItemProps) {
    const {
        register,
        formState: { errors },
        setValue,
        watch,
    } = form;
    const [phoneNumber, setPhoneNumber] = useState("");

    // Watch phone number value
    const watchedPhone = watch("phoneNumber");

    // Handle phone number input changes
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;

        // Remove non-digit characters
        const digits = value.replace(/\D/g, "");

        // Only allow if starts with 0 or 1 and max 11 digits
        if (digits.length <= 11) {
            setPhoneNumber(digits);
            setValue("phoneNumber", digits, { shouldValidate: true });
        }
    };

    // Format phone number for display
    const formatPhoneNumber = (phone: string) => {
        if (!phone) return "";

        // Add +88 prefix for display
        return `+88 ${phone.replace(/(\d{2})(\d{4})(\d{5})/, "$1 $2 $3")}`;
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
                <div className="space-y-3">
                    <label className="group relative block cursor-pointer">
                        <input
                            className="peer sr-only"
                            name="delivery"
                            type="radio"
                            defaultChecked
                        />
                        <div className="custom-radio-border flex items-center justify-between rounded-lg border border-neutral-200 p-4 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600">
                            <div className="flex items-center gap-4">
                                <div className="radio-indicator flex size-5 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800">
                                    <div className="size-2.5 rounded-full bg-white"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-primary dark:text-white">
                                        Inside Dhaka
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        2-3 business days
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-primary dark:text-white">
                                ৳ 60
                            </p>
                        </div>
                    </label>
                    <label className="group relative block cursor-pointer">
                        <input
                            className="peer sr-only"
                            name="delivery"
                            type="radio"
                        />
                        <div className="custom-radio-border flex items-center justify-between rounded-lg border border-neutral-200 p-4 transition-all hover:border-neutral-300 dark:border-neutral-700 dark:hover:border-neutral-600">
                            <div className="flex items-center gap-4">
                                <div className="radio-indicator flex size-5 items-center justify-center rounded-full border border-neutral-300 bg-white dark:border-neutral-600 dark:bg-neutral-800">
                                    <div className="size-2.5 rounded-full bg-white"></div>
                                </div>
                                <div>
                                    <p className="font-bold text-primary dark:text-white">
                                        Outside Dhaka
                                    </p>
                                    <p className="text-xs text-neutral-500">
                                        3-5 business days
                                    </p>
                                </div>
                            </div>
                            <p className="font-bold text-primary dark:text-white">
                                ৳ 120
                            </p>
                        </div>
                    </label>
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
                <div className="space-y-4">
                    <label className="cursor-pointer block">
                        <input
                            className="peer sr-only"
                            name="payment"
                            type="radio"
                            defaultChecked
                        />
                        <div className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-all hover:bg-neutral-50 peer-checked:border-[#e2136e] peer-checked:bg-[#e2136e]/5 peer-checked:ring-1 peer-checked:ring-[#e2136e] dark:border-neutral-700 dark:hover:bg-neutral-800 dark:peer-checked:border-[#e2136e] dark:peer-checked:bg-[#e2136e]/10">
                            <div className="flex-shrink-0">
                                <div className="flex size-10 items-center justify-center rounded-full bg-[#e2136e] text-white">
                                    <span className="material-symbols-outlined">
                                        send_to_mobile
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="block font-bold text-[#e2136e] mb-1">
                                    Bkash
                                </span>
                                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    01710110733 Bkash,Nagad,(Rocket +6) Personal
                                    Account এখানে Send Money করে এর স্ক্রিনশট
                                    আমাদের Whatsapp করুন । Whatsapp: 01626328524
                                </p>
                            </div>
                        </div>
                    </label>
                    <label className="cursor-pointer block">
                        <input
                            className="peer sr-only"
                            name="payment"
                            type="radio"
                        />
                        <div className="flex items-start gap-4 rounded-lg border border-neutral-200 p-4 transition-all hover:bg-neutral-50 peer-checked:border-primary peer-checked:bg-primary/5 peer-checked:ring-1 peer-checked:ring-primary dark:border-neutral-700 dark:hover:bg-neutral-800 dark:peer-checked:bg-primary/20 dark:peer-checked:border-primary">
                            <div className="flex-shrink-0">
                                <div className="flex size-10 items-center justify-center rounded-full bg-primary text-white dark:bg-white dark:text-primary">
                                    <span className="material-symbols-outlined">
                                        handshake
                                    </span>
                                </div>
                            </div>
                            <div className="flex-1">
                                <span className="block font-bold text-primary dark:text-white mb-1">
                                    Cash on Delivery
                                </span>
                                <p className="text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                                    Cash on Delivery (COD) ঢাকা মেট্রোপলিটন
                                    সিটির ভেতরে ডেলিভেরির পরে টাকা ( COD)
                                    পেমেন্ট করতে পারবেন ঢাকার মেট্রোপলিটন সিটির
                                    বাহিরে ডেলিভারির ক্ষেত্রে সর্বনিম্ন ১০০০
                                    টাকা অগ্রিম পেমেন্ট করতে হবে, ৪৮ থেকে ৭২
                                    ঘন্টার ভেতরে মাছ ডেলিভারি করা হবে।
                                </p>
                            </div>
                        </div>
                    </label>
                </div>
            </section>
        </div>
    );
}
