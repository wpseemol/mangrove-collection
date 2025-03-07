'use client';

import ButtonLoading from '@/components/button-loading';
import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/sonner';

import { loginSchema } from '@/lib/schemas/zod/login-schema';

import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';
import { toast } from 'sonner';
import { z } from 'zod';

export default function LoginForm() {
    // const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
                label: 'Undo',
                onClick: () => console.log('Undo'),
            },
        });

        console.log('login Form:', values);
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-y-4 -mt-2">
                    {/* input email */}

                    <div className="grid gap-2">
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field, fieldState }) => (
                                <FormItem>
                                    <Label htmlFor="email">Email</Label>

                                    <FormControl>
                                        <Input
                                            id="email"
                                            type="email"
                                            {...field}
                                            className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
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
                    <div className="grid gap-2">
                        {/* if forget password */}
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="#"
                                className="ml-auto inline-block text-sm underline">
                                Forgot your password?
                            </Link>
                        </div>
                        <PasswordField form={form} />
                    </div>

                    {/* input  password */}

                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                        className="w-full text-white">
                        Login {form.formState.isSubmitting && <ButtonLoading />}
                    </Button>

                    {/* <div className="space-y-2 w-full">
                        <Button
                            disabled={form.formState.isSubmitting}
                            variant="default"
                            className={`disabled:cursor-wait w-full bg-primary hover:bg-primary-foreground duration-100 text-neutral-100`}>
                            Login
                            {form.formState.isSubmitting && <ButtonLoading />}
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
                    </div> */}
                </form>
                <Button variant="outline" className="w-full mt-4">
                    Login with Google
                </Button>
                <div className="mt-4 text-center text-sm">
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="underline">
                        Sign up
                    </Link>
                </div>
            </Form>
            <Toaster />
        </>
    );
}

type PasswordFieldProps = {
    form: UseFormReturn<z.infer<typeof loginSchema>>;
};

function PasswordField({ form }: PasswordFieldProps) {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <>
            <FormField
                control={form.control}
                name="password"
                render={({ field, fieldState }) => (
                    <FormItem className="relative">
                        <FormControl>
                            <Input
                                id="password"
                                type={isHidden ? 'text' : 'password'}
                                {...field}
                                className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                placeholder={isHidden ? 'Password' : '********'}
                            />
                        </FormControl>
                        <span
                            onClick={() => setIsHidden((prev) => !prev)}
                            className="absolute right-4 top-1">
                            {isHidden ? (
                                <PiEyeDuotone />
                            ) : (
                                <PiEyeClosedDuotone />
                            )}
                        </span>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}
