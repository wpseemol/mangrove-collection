'use client';

import ButtonLoading from '@/components/button-loading';
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
import { Toaster } from '@/components/ui/sonner';

import { registerSchema } from '@/lib/schemas/zod/register-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useForm, UseFormReturn } from 'react-hook-form';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';
import { toast } from 'sonner';
import { z } from 'zod';

export default function RegisterForm() {
    // const router = useRouter();

    const form = useForm<z.infer<typeof registerSchema>>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            firstName: '',
            lastName: '',
            email: '',
            phone: '',
            password: '',
            conformPass: '',
        },
    });

    // 2. Define a submit handler.
    async function onSubmit(values: z.infer<typeof registerSchema>) {
        // toast({
        //     variant: 'destructive',
        //     description: 'An unexpected error occurred.',
        // });

        toast('Event has been created', {
            description: 'Sunday, December 03, 2023 at 9:00 AM',
            action: {
                label: 'Undo',
                onClick: () => console.log('Undo'),
            },
        });
        console.log('register values:', values);
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid gap-4 -mt-2">
                    {/* input email */}

                    {/* first name and last name */}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                            <div className="w-full">
                                <InputField
                                    form={form}
                                    name="firstName"
                                    type="text"
                                    label="First name*"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                        <div className="grid gap-2">
                            <div className="w-full">
                                <InputField
                                    form={form}
                                    name="lastName"
                                    type="text"
                                    label="Last name*"
                                    placeholder="Robinson"
                                />
                            </div>
                        </div>
                    </div>

                    {/* first name and last name */}

                    <div className="grid gap-2">
                        <InputField
                            form={form}
                            name="email"
                            type="email"
                            label="Email address*"
                            placeholder="leroy@jenkins.com"
                        />
                    </div>
                    <div className="grid gap-2">
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

                    <Button
                        disabled={form.formState.isSubmitting}
                        type="submit"
                        className="w-full text-white">
                        Create an account
                        {form.formState.isSubmitting && <ButtonLoading />}
                    </Button>
                </form>
                <Button variant="outline" className="w-full mt-4">
                    Sign up with Google
                </Button>
                <div className="mt-4 text-center text-sm">
                    Already have an account?{' '}
                    <Link href="/login" className="underline">
                        Sign in
                    </Link>
                </div>
            </Form>
            <Toaster />
        </>
    );
}

type InputFieldProps = {
    form: UseFormReturn<z.infer<typeof registerSchema>>;
    name:
        | 'firstName'
        | 'lastName'
        | 'email'
        | 'password'
        | 'conformPass'
        | 'phone';
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
                    <FormLabel htmlFor={name} className="">
                        {label}
                    </FormLabel>

                    <FormControl>
                        <Input
                            id={name}
                            type={type}
                            {...field}
                            className="w-full bg-transparent border border-neutral-500/20
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded "
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
            <div className="grid gap-2">
                <FormField
                    control={form.control}
                    name="password"
                    render={({ field, fieldState }) => (
                        <FormItem className="relative">
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
                                            p-3 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded "
                                    placeholder={
                                        isHidden ? 'Password' : '********'
                                    }
                                />
                            </FormControl>

                            <span
                                onClick={() => setIsHidden((prev) => !prev)}
                                className={`absolute right-4  ${
                                    strengthLevel ? 'top-[67px]' : 'top-9'
                                }`}>
                                {isHidden ? (
                                    <PiEyeDuotone />
                                ) : (
                                    <PiEyeClosedDuotone />
                                )}
                            </span>

                            <FormMessage>
                                {fieldState.error?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
            </div>
            <div className="grid gap-2 relative">
                <span
                    onClick={() => setIsHidden((prev) => !prev)}
                    className="absolute right-4 top-11">
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
