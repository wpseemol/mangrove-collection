'use client';

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
import { loginSchema } from '@/lib/schemas/zod/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';
import { z } from 'zod';

import Link from 'next/link';
import { FcSynchronize } from 'react-icons/fc';

export default function LoginForm() {
    const [loading, setLoading] = useState(false);

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2. Define a submit handler.
    function onSubmit(values: z.infer<typeof loginSchema>) {
        console.log('login data:', values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="flex flex-col justify-center items-center  gap-y-5 md:w-96">
                {/* input email */}

                <div className="w-full">
                    <FormField
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
                        variant="default"
                        className={`${
                            loading ? 'cursor-wait' : ''
                        } w-full bg-primary hover:bg-primary-foreground duration-100 text-neutral-100`}>
                        Login
                        {loading && (
                            <>
                                ...
                                <span className="ml-2">
                                    <FcSynchronize className="text-xl animate-spin" />
                                </span>
                            </>
                        )}
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
    );
}

type PasswordFieldProps = {
    form: UseFormReturn<z.infer<typeof loginSchema>>;
};

function PasswordField({ form }: PasswordFieldProps) {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <>
            <span
                onClick={() => setIsHidden((prev) => !prev)}
                className="absolute right-4 top-12">
                {isHidden ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
            </span>

            <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="">Password</FormLabel>

                        <FormControl>
                            <Input
                                type={isHidden ? 'text' : 'password'}
                                {...field}
                                className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded h-12 "
                                placeholder={isHidden ? 'Password' : '********'}
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}