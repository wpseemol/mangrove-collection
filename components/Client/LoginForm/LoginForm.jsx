'use client';

import loginAction from '@/app/actions/login-action';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { Toaster } from 'react-hot-toast';
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
                        <FormField
                            className="w-full"
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel className="">
                                        Email address
                                    </FormLabel>

                                    <FormControl>
                                        <Input
                                            type="email"
                                            {...field}
                                            className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded h-12 "
                                            placeholder="leroy@jenkins.com"
                                        />
                                    </FormControl>
                                    <FormMessage>
                                        {fieldState.error?.message}
                                    </FormMessage>
                                </FormItem>
                            )}
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
