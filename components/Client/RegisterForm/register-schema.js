import { z } from 'zod';

const registerSchema = z.object({
    fullName: z.string().nonempty({
        message: 'Please input your name.',
    }),
    email: z.string().nonempty({
        message: 'Input your email address.',
    }),
    password: z
        .string()
        .nonempty({ message: 'Please input password then try login.' })
        .min(6, { message: 'Password must be at least 6 characters long.' }),
    conformPass: z.string().nonempty({
        message: 'Please input confirm password then try login.',
    }),
    phone: z.string().nonempty({
        message: 'Please input phone number.',
    }),
});

export { registerSchema };
