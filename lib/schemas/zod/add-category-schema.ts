import { z } from 'zod';

const addCategorySchema = z.object({
    name: z.string().min(1, {
        message: 'Category name are required to create categories.',
    }),
    slug: z.string().min(1, {
        message: 'Must slugs are required to create categories.',
    }),
    imgUrl: z.string().min(1, {
        message: 'Please upload image for a category.',
    }),
});

export { addCategorySchema };
