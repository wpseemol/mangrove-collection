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
