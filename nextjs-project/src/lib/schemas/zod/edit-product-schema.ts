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
