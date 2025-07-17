import z from "zod";

export const productNameSchema = z.object({
     name: z.string().min(1, {
          message: "Must be input the product name.",
     }),
});

export const productSlugSchema = z.object({
     slug: z
          .string()
          .min(1, {
               message: "Must be input product slug.",
          })
          .regex(
               /^[a-zA-Z0-9-]+$/,
               "Only letters, numbers, and hyphens allowed (no spaces)"
          ),
});

export const productUnitSchema = z.object({
     unit: z.string().refine((val) => val === "pc" || val === "kg", {
          message: "Unit must be 'pc' or 'kg'",
     }),
});

export const productDescriptionSchema = z.object({
     description: z.string().min(1, {
          message: "Must be input product description.",
     }),
});

export const productThumbnailSchema = z.object({
     thumbnail: z.string().optional().or(z.literal("")),
});
