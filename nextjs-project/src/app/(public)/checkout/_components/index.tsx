"use client";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import OrderSummary from "./order-summary";
import FormItem from "./form-item";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    checkoutSchema,
    CheckoutSchemaType,
} from "@/lib/schemas/zod/checkout-schema";

export default function TestCheckout() {
    const form = useForm<CheckoutSchemaType>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            phoneNumber: "",
            city: "",
            district: "",
            fullAddress: "",
            fullName: "",
            termsAccepted: false,
            zipCode: "",
        },
    });

    async function onSubmit(data: CheckoutSchemaType) {
        console.log("submit:", data);
    }

    return (
        <>
            {/* breadcrumb Product page*/}
            <DynamicBreadcrumb />

            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col lg:flex-row gap-10 "
            >
                <FormItem form={form} />
                {/* order summary */}
                <OrderSummary form={form} />
            </form>

            <footer className="mt-auto border-t border-[#ededed] bg-white py-12 dark:border-neutral-800 dark:bg-[#1e1e1e]">
                <div className="mx-auto max-w-[1280px] px-4 text-center sm:px-6 lg:px-8">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        © 2023 ShopName Inc. All rights reserved.
                    </p>
                </div>
            </footer>
        </>
    );
}
