"use client";

import {
    ShippingCostArray,
    shippingCostArraySchema,
} from "@/lib/schemas/zod/edit-product-schema";
import { ShippingCostType } from "@/types/mongoose/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";

interface ProductShippingCostFormProps {
    content: string;
    productId: string;
}

export default function ProductShippingCostForm({
    content,
    productId,
}: ProductShippingCostFormProps) {
    const shippingData = JSON.parse(content) as ShippingCostType[];

    const form = useForm<ShippingCostArray>({
        resolver: zodResolver(shippingCostArraySchema),
        defaultValues: { shippingOptions: shippingData },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "shippingOptions",
    });

    async function onSubmit(submitData: ShippingCostArray) {
        console.log("submit data:", submitData);
        console.log("product id:", productId);
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)}>
            {fields.map((sOption) => (
                <Fragment key={sOption.id}>
                    <label htmlFor="wait">wait</label>
                </Fragment>
            ))}
        </form>
    );
}
