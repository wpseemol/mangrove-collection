import { UseFormReturn } from "react-hook-form";
import z from "zod";

export const checkoutSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(1, "Full Name is required")
        .max(100, "Name is too long")
        .regex(/^[a-zA-Z\s.'-]+$/, "Name contains invalid characters"),

    phoneNumber: z
        .string()
        .trim()
        .regex(
            /^01[3-9]\d{8}$/,
            "Invalid BD phone number (must be 11 digits starting with 01[3-9])"
        )
        .length(11, "Phone number must be exactly 11 digits"),

    fullAddress: z
        .string()
        .trim()
        .min(10, "Address must be at least 10 characters")
        .max(500, "Address is too long")
        .refine(
            (val) => !/[<>{}[\]`]/.test(val),
            "Address contains invalid characters"
        ),

    // District field
    district: z
        .string()
        .trim()
        .min(1, "District is required.")
        .max(100, "District name is too long.")
        .regex(/^[a-zA-Z\s.-]+$/, "District contains invalid characters."),

    // City field
    city: z
        .string()
        .trim()
        .min(1, "City is required.")
        .max(100, "City name is too long.")
        .regex(/^[a-zA-Z\s.-]+$/, "City contains invalid characters."),

    shippingCostId: z
        .string()
        .min(1, "Shipping method is required")
        .refine(
            (val) => /^[a-zA-Z0-9_-]+$/.test(val),
            "Invalid shipping ID format."
        ),

    // Payment Method
    paymentMethod: z.enum(["bKash", "rocket", "nagad", "cod"], {
        errorMap: () => ({ message: "Please select a valid payment method." }),
    }),

    termsAccepted: z.boolean().refine((val) => val === true, {
        message: "You must accept the terms and conditions.",
    }),
});

/* Types */
export type CheckoutSchemaType = z.infer<typeof checkoutSchema>;

export type CheckoutFormType = UseFormReturn<CheckoutSchemaType>;
