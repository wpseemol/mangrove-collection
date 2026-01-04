"use client";

import OrderSummary from "./order-summary";
import FormItem from "./form-item";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    checkoutSchema,
    CheckoutSchemaType,
} from "@/lib/schemas/zod/checkout-schema";

import { PurchaseProductsType } from "@/types/purchase";
import { INSIDE_DHAKA } from "@/lib/constant";
import { orderConfirm } from "@/lib/actions/order-confirm";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface CheckoutFormComponentsProps {
    purchasesData: string;
}

export default function CheckoutFormComponent({
    purchasesData,
}: CheckoutFormComponentsProps) {
    const buyProductData = JSON.parse(purchasesData) as PurchaseProductsType[];

    const form = useForm<CheckoutSchemaType>({
        resolver: zodResolver(checkoutSchema),
        defaultValues: {
            phoneNumber: "",
            city: "",
            district: "",
            fullAddress: "",
            fullName: "",
            termsAccepted: false,
            shippingCostId: INSIDE_DHAKA,
            paymentMethod: "cod",
        },
    });

    const router = useRouter();

    async function onSubmit(data: CheckoutSchemaType) {
        const isConfirm = await orderConfirm(JSON.stringify(data));
        if (isConfirm.success) {
            Swal.fire({
                position: "center",
                icon: "success",

                title: isConfirm.message || "Successful your product checkout.",
                showConfirmButton: false,
                timer: 1500,
            });
            router.push("/my-order");
        }
    }

    return (
        <>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col lg:flex-row gap-10 "
            >
                <FormItem form={form} buyProductData={buyProductData} />
                {/* order summary */}
                <OrderSummary form={form} buyProductData={buyProductData} />
            </form>
        </>
    );
}
