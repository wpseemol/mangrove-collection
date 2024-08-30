import { z } from 'zod';

const addProductSchema = z.object({
    name: z.string().min(1, {
        message: 'Must be input the product.',
    }),
    slug: z.string().min(1, {
        message: 'Must be input product slug.',
    }),
    unit: z.string(),
    description: z.string().min(1, {
        message: 'Must be input product description',
    }),
    thumbnail: z.string().min(1, {
        message: 'Must be product thumbnail image',
    }),
    images: z.array(
        z.object({
            id: z.string(),
            imgUrl: z.string(),
        })
    ),
    variants: z.array(
        z.object({ id: z.string(), type: z.string(), title: z.string() })
    ),
    currency: z.string().min(1, {
        message: 'Please select price currency.',
    }),
    price: z.array(
        z.object({
            variantId: z.string(),
            price: z.coerce.number(),
            select: z.boolean(),
        })
    ),
    category: z.string().min(1, {
        message: 'Please select category, then submit agin.',
    }),
    shortDescription: z.string(),
    tags: z.array(z.string()),
});

export { addProductSchema };
