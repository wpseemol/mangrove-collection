import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useState } from 'react';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';

export default function PasswordField({ form }) {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <>
            <span
                onClick={() => setIsHidden((prev) => !prev)}
                className="absolute right-4 top-12">
                {isHidden ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
            </span>

            <FormField
                className="w-full"
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
