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
        message: 'Must be input product description',
    }),
    thumbnail: z.string().nonempty({
        message: 'Must be product thumbnail image',
    }),
    images: z.array(
        z.object({
            id: z.string(),
            firebaseUrl: z.string(),
        })
    ),
    variants: z.array(
        z.object({ id: z.string(), type: z.string(), title: z.string() })
    ),
});

export { formSchema };
