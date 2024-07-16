import { z } from 'zod';

const formSchema = z.object({
    name: z.string().nonempty({
        message: 'Must be input the product.',
    }),
    slug: z.string().nonempty({
        message: 'Must be input product slug.',
    }),
    unit: z.string(),
    price: z.coerce.number(),
    description: z.string().nonempty({
        message: 'Must be input product Description',
    }),
});

export { formSchema };
