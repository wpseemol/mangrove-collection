'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Toaster } from 'react-hot-toast';
import InputField from './input-fild';
import { loginSchema } from './login-schema';

export default function LoginForm() {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values) {
        console.log('login page:', values);
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6 md:w-96">
                    {/* input email */}

                    <InputField
                        form={form}
                        name="email"
                        type="email"
                        label="Email address"
                        placeholder="leroy@jenkins.com"
                    />

                    {/* input email */}

                    {/* input password */}

                    <InputField
                        form={form}
                        name="password"
                        type="password"
                        label="Password"
                        placeholder="password"
                    />

                    {/* input  password */}

                    <div className="space-y-2">
                        <Button
                            variant=""
                            className="w-full bg-primaryColor hover:bg-green-700 duration-100">
                            Login
                        </Button>

                        <p className="px-4 text-sm text-center dark:text-gray-600">
                            {`Don't have an account yet?`}
                            <Link
                                rel="noopener noreferrer"
                                href="/register"
                                className="hover:underline text-primaryColor">
                                Sign up
                            </Link>
                            .
                        </p>
                    </div>
                </form>
            </Form>

            <Toaster />
        </>
    );
}
