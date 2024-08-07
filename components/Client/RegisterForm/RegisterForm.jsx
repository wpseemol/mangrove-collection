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
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import PasswordOrConfirmPassField from './password-or-confirm-fild';
import { registerSchema } from './register-schema';

export default function RegisterForm() {
    const router = useRouter();

    const form = useForm({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            fullName: '',
            email: '',
            phone: '',
            password: '',
            conformPass: '',
        },
    });

    async function onSubmit(values) {
        const { conformPass, ...regForm } = values;

        if (conformPass !== values.password) {
            toast({
                variant: 'destructive',
                description: 'Your message has been sent.',
            });
            return;
        }

        try {
            const isCrete = await fetch('/api/v1/user/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(regForm),
            });

            if (isCrete?.ok) {
                toast({
                    variant: 'success',
                    description: 'User register successful😀!',
                });

                router.push('/login');
                form.reset();
            }

            console.log(isCrete);
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
                            variant=""
                            className="w-full bg-primaryColor hover:bg-green-700 duration-100">
                            Login
                        </Button>

                        <p className="px-4 text-sm text-center dark:text-gray-600">
                            {`Already have an account?`}
                            <Link
                                rel="noopener noreferrer"
                                href="/login"
                                className="hover:underline text-primaryColor">
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

function InputField({ form, name, label, placeholder, type = 'text' }) {
    return (
        <FormField
            className="w-full"
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
