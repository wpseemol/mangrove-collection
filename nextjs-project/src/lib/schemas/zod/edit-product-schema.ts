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
    unit: z.enum(["kg", "pc"], {
        errorMap: () => ({ message: "Unit must be either 'kg' or 'pc'" }),
    }),
});

export const productDescriptionSchema = z.object({
    description: z.string().min(1, {
        message: "Must be input product description.",
    }),
});

export const productThumbnailSchema = z.object({
    thumbnail: z.string().min(1, {
        message: "Must be product thumbnail image",
    }),
});

export const productImagesSchema = z.object({
    images: z.array(
        z.object({
            id: z.string(),
            imgUrl: z.string(),
        })
    ),
});

export const productPriceVariantSchema = z.object({
    variants: z.array(
        z.object({
            id: z.string(),
            type: z.string().min(1, {
                message: "Please select variant type.",
            }),
            title: z.string().min(1, {
                message: "Please input variant title.",
            }),
        })
    ),

    price: z.array(
        z.object({
            variantId: z.string(),
            price: z.coerce.number().min(1, {
                message: "Please input product price.",
            }),
            select: z.boolean(),
        })
    ),
});

export const productCategorySchema = z.object({
    category: z.string().min(1, {
        message: "Please select category, then submit again.",
    }),
});

export const productShortDescriptionSchema = z.object({
    shortDescription: z.string(),
});

export const productTagsSchema = z.object({
    tags: z
        .array(z.string())
        .refine((tags) => new Set(tags).size === tags.length, {
            message: "Tags must be unique.",
            path: ["tags"],
        }),
});

export const shippingCostSchema = z.object({
    shippingId: z.string().min(1, { message: "Shipping ID is required" }),

    title: z
        .string()
        .min(1, { message: "Title is required" })
        .max(100, "Title is to log."),

    price: z.coerce.number().positive({ message: "Price must be positive" }),

    shortDescription: z
        .string()
        .min(1, { message: "Description is required" })
        .max(150, "Short description is to log."),
});

// Schema for an array of shipping cost objects
export const shippingCostArraySchema = z.object({
    shippingCost: z.array(shippingCostSchema),
});

// Type inference
export type ShippingCostType = z.infer<typeof shippingCostSchema>;
export type ShippingCostArray = z.infer<typeof shippingCostArraySchema>;
