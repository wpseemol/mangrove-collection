"use client";

import { Button } from "@/components/ui/button";
import { productContentUpdate } from "@/lib/actions/product";
import {
    ShippingCostArray,
    shippingCostArraySchema,
} from "@/lib/schemas/zod/edit-product-schema";
import { ShippingCostType } from "@/types/mongoose/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

interface ProductShippingCostFormProps {
    currency: string;
    content: string;
    productId: string;
}

export default function ProductShippingCostForm({
    currency,
    content,
    productId,
}: ProductShippingCostFormProps) {
    const shippingData = JSON.parse(content) as ShippingCostType[];

    const [isDisabled, setIsDisabled] = useState<boolean>(false);

    const form = useForm<ShippingCostArray>({
        resolver: zodResolver(shippingCostArraySchema),
        defaultValues: { shippingCost: shippingData },
    });

    const { fields } = useFieldArray({
        control: form.control,
        name: "shippingCost",
    });

    const watchedFields = form.watch(["shippingCost"]);

    useEffect(() => {
        const currentValues = form.getValues().shippingCost;
        setIsDisabled(JSON.stringify(currentValues) === content);
    }, [watchedFields, content]);

    const pathName = usePathname();

    async function onSubmit(submitData: ShippingCostArray) {
        const response = await productContentUpdate(
            productId,
            submitData,
            "shippingCost",
            pathName
        );

        if (response.success) {
            toast.success(response.message);
        } else {
            toast.error(response.message);
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {fields.map((sOption, index) => (
                <div
                    key={sOption.id}
                    className="p-4 border border-neutral-700/20 rounded-lg space-y-4"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Title */}
                        <div className="space-y-2">
                            <label
                                htmlFor={`shippingCost.${index}.title`}
                                className="text-gray-700 font-medium"
                            >
                                Title *
                            </label>
                            <input
                                id={`shippingCost.${index}.title`}
                                type="text"
                                {...form.register(
                                    `shippingCost.${index}.title`
                                )}
                                className="w-full p-2 border border-neutral-700/40 rounded"
                                placeholder="e.g., Standard Shipping, Express Delivery"
                                maxLength={100}
                            />
                            {form.formState.errors.shippingCost?.[index]
                                ?.title && (
                                <p className="text-red-500 text-sm">
                                    {
                                        form.formState.errors.shippingCost[
                                            index
                                        ].title?.message
                                    }
                                </p>
                            )}
                        </div>

                        {/* Price */}
                        <div className="space-y-2">
                            <label
                                htmlFor={`shippingCost.${index}.price`}
                                className="text-gray-700  font-medium"
                            >
                                Price *
                            </label>
                            <div className="relative">
                                <span className="absolute left-3 top-[9px]">
                                    {currency === "taka" && <>&#2547;</>}
                                    {currency === "dollar" && <>&#36;</>}
                                </span>
                                <input
                                    id={`shippingCost.${index}.price`}
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    {...form.register(
                                        `shippingCost.${index}.price`
                                    )}
                                    className="w-full p-2 pl-8 border-neutral-700/40 border rounded"
                                    placeholder="0.00"
                                />
                            </div>
                            {form.formState.errors.shippingCost?.[index]
                                ?.price && (
                                <p className="text-red-500 text-sm">
                                    {
                                        form.formState.errors.shippingCost[
                                            index
                                        ].price?.message
                                    }
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Short Description */}
                    <div className="space-y-2">
                        <label
                            htmlFor={`shippingCost.${index}.shortDescription`}
                            className="text-gray-700 font-medium"
                        >
                            Short Description *
                        </label>
                        <input
                            id={`shippingCost.${index}.shortDescription`}
                            {...form.register(
                                `shippingCost.${index}.shortDescription`
                            )}
                            className="w-full p-2 border border-neutral-700/40 rounded"
                            placeholder="e.g., Delivered  in 3-5 business days"
                            maxLength={150}
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                            <span>Max 150 characters</span>
                            <span>
                                {form.watch(
                                    `shippingCost.${index}.shortDescription`
                                )?.length || 0}
                                /150
                            </span>
                        </div>
                        {form.formState.errors.shippingCost?.[index]
                            ?.shortDescription && (
                            <p className="text-red-500 text-sm">
                                {
                                    form.formState.errors.shippingCost[index]
                                        .shortDescription?.message
                                }
                            </p>
                        )}
                    </div>
                </div>
            ))}

            {/* Submit Button */}
            <div className="pt-4">
                <Button
                    disabled={isDisabled || form.formState.isSubmitting}
                    type="submit"
                    className=" text-white disabled:cursor-not-allowed disabled:pointer-events-auto cursor-pointer"
                >
                    {form.formState.isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
            </div>
        </form>
    );
}
