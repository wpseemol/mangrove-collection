import { z } from 'zod';

const addCategorySchema = z.object({
    name: z.string().min(1, {
        message: 'Must be input the product.',
    }),
    slug: z.string().min(1, {
        message: 'Must be input product slug.',
    }),
    imgUrl: z.string(),
});

export { addCategorySchema };
