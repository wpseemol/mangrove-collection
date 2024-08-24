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
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { registerSchema } from '@/lib/schemas/zod/register-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { FcSynchronize } from 'react-icons/fc';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';
import { z } from 'zod';

export default function RegisterForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            conformPass: '',
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof registerSchema>) {
        setLoading(true);
        const { conformPass, ...regForm } = values;

        if (conformPass !== values.password) {
            form.setError('conformPass', {
                type: 'required',
                message: 'Password and confirm password do not match.',
            });
            setLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/v1/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(regForm),
            });

            if (!response.ok) {
                const error = await response.json();
                console.log(error);

                if (error.pattern === 'email') {
                    form.setError('email', {
                        type: 'required',
                        message: error.message,
                    });
                } else if (error.pattern === 'phone') {
                    form.setError('phone', {
                        type: 'required',
                        message: error.message,
                    });
                } else {
                    throw new Error(error.message);
                }

                return;
            }

            toast({
                variant: 'default',
                description: 'User registration is successful!',
            });
        } catch (error) {
            if (error instanceof Error) {
                toast({
                    variant: 'destructive',
                    description: error.message,
                });
            } else {
                // Handle unexpected error types
                toast({
                    variant: 'destructive',
                    description: 'An unexpected error occurred.',
                });
            }
        } finally {
            setLoading(false);
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
                            name="fullName"
                            type="text"
                            label="Full name*"
                            placeholder="Full name"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            form={form}
                            name="email"
                            type="email"
                            label="Email address*"
                            placeholder="leroy@jenkins.com"
                        />
                    </div>
                    <div className="w-full">
                        <InputField
                            form={form}
                            name="phone"
                            type="text"
                            label="Phone*"
                            placeholder="+8801711111122"
                        />
                    </div>

                    {/* input email */}

                    {/* input password */}

                    <PasswordOrConfirmPassField form={form} />

                    {/* input  password */}

                    <div className="space-y-2 w-full">
                        <Button
                            variant="default"
                            className={`${
                                loading ? 'cursor-wait' : ''
                            } w-full bg-primary hover:bg-primary-foreground duration-100 text-neutral-100`}>
                            Register
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
                            {`Already have an account?`}
                            <Link
                                href="/login"
                                className="hover:underline text-primary">
                                Login
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

type InputFieldProps = {
    form: UseFormReturn<z.infer<typeof registerSchema>>;
    name: 'fullName' | 'email' | 'password' | 'conformPass' | 'phone';
    label: string;
    placeholder: string;
    type: string;
};

function InputField({
    form,
    name,
    label,
    placeholder,
    type = 'text',
}: InputFieldProps) {
    return (
        <FormField
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="">{label}</FormLabel>

                    <FormControl>
                        <Input
                            type={type}
                            {...field}
                            className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded h-12 "
                            placeholder={placeholder}
                        />
                    </FormControl>
                    <FormMessage>{fieldState.error?.message}</FormMessage>
                </FormItem>
            )}
        />
    );
}

type PasswordOrConfirmPassFieldProps = {
    form: UseFormReturn<z.infer<typeof registerSchema>>;
};

// password label check there.
function PasswordOrConfirmPassField({ form }: PasswordOrConfirmPassFieldProps) {
    const [isHidden, setIsHidden] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');

    const [strengthLevel, setStrengthLevel] = useState<string | null>(null);

    // Memoize the password strength calculation
    const strengthScore = useMemo(() => {
        const containsUpperCase = /[A-Z]/.test(passwordValue);
        const containsLowerCase = /[a-z]/.test(passwordValue);
        const containsNumber = /[0-9]/.test(passwordValue);
        const containsSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
            passwordValue
        );
        return (
            (containsSpecial ? 1 : 0) +
            (containsUpperCase ? 1 : 0) +
            (containsLowerCase ? 1 : 0) +
            (containsNumber ? 1 : 0)
        );
    }, [passwordValue]);

    // Set password strength level based on the score
    useEffect(() => {
        if (passwordValue.length > 5) {
            switch (strengthScore) {
                case 1:
                case 2:
                    setStrengthLevel('Weak');
                    style = 'text-[#ff2323]';
                    break;
                case 3:
                    setStrengthLevel('Medium');
                    style = 'text-[#fecf02]';
                    break;
                case 4:
                    setStrengthLevel('Strong');
                    style = 'text-[#0dc547]';
                    break;
                default:
                    setStrengthLevel(null);
            }
        } else {
            setStrengthLevel(null);
            style = '';
        }
    }, [strengthScore, passwordValue]);

    // Clear the strength level after 5 seconds
    useEffect(() => {
        if (strengthLevel) {
            const timer = setTimeout(() => {
                setStrengthLevel(null);
                style = '';
            }, 5000);

            return () => clearTimeout(timer); // Cleanup on unmount or on strengthLevel change
        }
    }, [strengthLevel]);

    const password = form.watch('password');

    useEffect(() => {
        setPasswordValue(password);
    }, [password]);

    return (
        <>
            <div className="w-full relative">
                <span
                    onClick={() => setIsHidden((prev) => !prev)}
                    className={`absolute right-4  ${
                        strengthLevel ? 'top-20' : 'top-12'
                    }`}>
                    {isHidden ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
                </span>

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel className="">Password*</FormLabel>
                            {strengthLevel && (
                                <p className={`${style}`}>
                                    {strengthLevel} password!
                                </p>
                            )}

                            <FormControl>
                                <Input
                                    type={isHidden ? 'text' : 'password'}
                                    {...field}
                                    className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded h-12 "
                                    placeholder={
                                        isHidden ? 'Password' : '********'
                                    }
                                />
                            </FormControl>
                            <FormMessage>
                                {fieldState.error?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
            </div>
            <div className="w-full relative">
                <span
                    onClick={() => setIsHidden((prev) => !prev)}
                    className="absolute right-4 top-12">
                    {isHidden ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
                </span>
                <InputField
                    form={form}
                    name="conformPass"
                    type={isHidden ? 'text' : 'password'}
                    label="Conform password*"
                    placeholder={isHidden ? 'Password' : '********'}
                />
            </div>
        </>
    );
}

let style = '';
