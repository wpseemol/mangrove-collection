import { z } from "zod";

const addProductSchema = z.object({
     name: z.string().min(1, {
          message: "Must be input the product name.",
     }),
     slug: z
          .string()
          .min(1, {
               message: "Must be input product slug.",
          })
          .regex(
               /^[a-zA-Z0-9-]+$/,
               "Only letters, numbers, and hyphens allowed (no spaces)"
          ),
     unit: z.string(),
     description: z.string().min(1, {
          message: "Must be input product description.",
     }),
     thumbnail: z.string().min(1, {
          message: "Must be product thumbnail image",
     }),
     images: z.array(
          z.object({
               id: z.string(),
               imgUrl: z.string(),
          })
     ),
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
     currency: z.string().min(1, {
          message: "Please select price currency.",
     }),
     price: z.array(
          z.object({
               variantId: z.string(),
               price: z.coerce.number().min(1, {
                    message: "Price input product price.",
               }),
               select: z.boolean(),
          })
     ),
     category: z.string().min(1, {
          message: "Please select category, then submit again.",
     }),
     shortDescription: z.string(),
     tags: z.array(z.string()),
});

export { addProductSchema };
