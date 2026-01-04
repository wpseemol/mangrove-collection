import { MAJOR_DISTRICTS } from "@/db/checkout";
import { CheckoutFormType } from "@/lib/schemas/zod/checkout-schema";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

interface CheckoutFormDistrictProps {
    form: CheckoutFormType;
}

export default function CheckoutFormDistrict({
    form,
}: CheckoutFormDistrictProps) {
    const {
        register,
        formState: { errors },
    } = form;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <label className="block">
            <span className="text-sm font-medium text-primary dark:text-neutral-200">
                District *
            </span>
            <div className="relative">
                <select
                    {...register("district")}
                    className={`mt-2 block w-full appearance-none rounded-lg border-neutral-200 bg-[#f7f7f7] px-4 py-3 pr-10 text-sm focus:border-primary focus:ring-primary dark:border-neutral-700 dark:bg-neutral-800 dark:text-white ${
                        errors.district
                            ? "border-red-500 focus:border-red-500 focus:ring-red-500"
                            : ""
                    }`}
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <option value="">Select District</option>
                    {MAJOR_DISTRICTS.map((district) => (
                        <option key={district.value} value={district.value}>
                            {district.label}
                        </option>
                    ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500 pointer-events-none" />
            </div>
            {errors.district && (
                <p className="mt-1 text-sm text-red-500">
                    {errors.district.message}
                </p>
            )}
        </label>
    );
}
