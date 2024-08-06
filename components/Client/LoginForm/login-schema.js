import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().nonempty({
        message: 'Must be input the Email.',
    }),
    password: z.string().nonempty({
        message: 'Please input password then try login.',
    }),
});

export { loginSchema };
