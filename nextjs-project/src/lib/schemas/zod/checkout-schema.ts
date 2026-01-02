import { UseFormReturn } from "react-hook-form";
import z from "zod";

export const checkoutSchema = z.object({
    fullName: z.string().min(1, "Full Name is required"),
    phoneNumber: z.string().regex(/^01[3-9]\d{8}$/, "Invalid BD phone number"),
    fullAddress: z.string().min(10, "Address must be at least 10 characters"),

    // District field
    district: z.string().min(1, "District is required"),

    // City field (could be optional if it's part of full address)
    city: z.string().min(1, "City is required"),

    // Updated zip code with proper validation
    zipCode: z
        .string()
        .min(4, "Postal code must be at least 4 digits")
        .max(6, "Postal code must be at most 6 digits")
        .regex(/^\d+$/, "Postal code must contain only numbers")
        .optional(),

    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions",
    }),
});

/* Types */
export type CheckoutSchemaType = z.infer<typeof checkoutSchema>;

export type CheckoutFormType = UseFormReturn<CheckoutSchemaType>;
