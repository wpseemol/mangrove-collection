'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';

export default function PasswordOrConfirmPassField({ form }) {
    const [isHidden, setIsHidden] = useState(false);
    const [passwordValue, setPasswordValue] = useState('');

    // password strong Check

    const containsUpperCase = /[A-Z]/.test(passwordValue);
    const containsLowerCase = /[a-z]/.test(passwordValue);
    const containsSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(
        passwordValue
    );
    const strengthScore =
        (containsSpecial ? 1 : 0) +
        (containsUpperCase ? 1 : 0) +
        (containsLowerCase ? 1 : 0);

    let strengthLevel;
    let style;
    if (passwordValue.length > 5) {
        if (strengthScore === 1) {
            strengthLevel = 'Weak';
            style = 'text-[#ff2323]';
        } else if (strengthScore === 2) {
            strengthLevel = 'Medium';
            style = 'text-[#fecf02]';
        } else if (strengthScore === 3) {
            strengthLevel = 'Strong';
            style = 'text-[#0dc547]';
        }
    }
    // password strong Check

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
                    className="w-full"
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
