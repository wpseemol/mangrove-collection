import { z } from 'zod';

const registerSchema = z.object({
    fullName: z.string().min(1, {
        message: 'Please input your name.',
    }),
    email: z.string().min(1, {
        message: 'Input your email address.',
    }),
    password: z
        .string()
        .min(1, { message: 'Please input password then try login.' })
        .min(6, { message: 'Password must be at least 6 characters long.' }),
    conformPass: z.string().min(1, {
        message: 'Please input confirm password then try login.',
    }),
    phone: z.string().min(1, {
        message: 'Please input phone number.',
    }),
});

export { registerSchema };
