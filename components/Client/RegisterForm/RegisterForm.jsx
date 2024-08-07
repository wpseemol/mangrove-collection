'use client';

import InputField from '@/components/client/input/input-field';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import PasswordOrConfirmPassField from './password-or-confirm-fild';
import { registerSchema } from './register-schema';

export default function RegisterForm() {
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

        console.log(regForm);
        form.reset();
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
