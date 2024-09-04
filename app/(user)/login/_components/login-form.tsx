'use client';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { loginSchema } from '@/lib/schemas/zod/login-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';
import { z } from 'zod';

import loginAction from '@/action/login';
import ButtonLoading from '@/components/button-loading';
import { Label } from '@/components/ui/label';
import { ToastAction } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { AuthError } from 'next-auth';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const { toast } = useToast();
    const router = useRouter();

    const form = useForm<z.infer<typeof loginSchema>>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: '',
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof loginSchema>) {
        try {
            await loginAction(values);
            const result = await signIn('credentials', {
                redirect: false,
                ...values,
            });

            if (result?.error && result.error === 'CredentialsSignin') {
                return;
            }
            router.refresh();
            form.reset();

            toast({
                variant: 'success',
                description: 'User login successful!',
            });
        } catch (error) {
            const errorType = error as AuthError;

            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: errorType?.message,
                action: (
                    <ToastAction altText="Try again">Try again</ToastAction>
                ),
            });
        }
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
                        className="w-full">
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
