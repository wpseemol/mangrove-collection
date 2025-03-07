import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().min(1, {
        message: 'Must input the Email.',
    }),
    password: z.string().min(1, {
        message: 'Please input password then try login.',
    }),
});

export { loginSchema };
