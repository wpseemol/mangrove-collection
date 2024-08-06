'use client';

import loginAction from '@/app/actions/login-action';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Toaster } from 'react-hot-toast';
import InputField from './input-field';
import { loginSchema } from './login-schema';
import PasswordField from './password-field';

export default function LoginForm() {
    const form = useForm({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    async function onSubmit(values) {
        try {
            const isLogin = loginAction(values);
            console.log('is login :', await isLogin);

            form.reset();
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="flex flex-col justify-center items-center  gap-y-5 md:w-96">
                    {/* input email */}

                    <div className="w-full">
                        <InputField
                            form={form}
                            name="email"
                            type="email"
                            label="Email address"
                            placeholder="leroy@jenkins.com"
                        />
                    </div>

                    {/* input email */}

                    {/* input password */}
                    <div className="w-full relative">
                        <PasswordField form={form} />
                    </div>

                    {/* input  password */}

                    <div className="space-y-2 w-full">
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
