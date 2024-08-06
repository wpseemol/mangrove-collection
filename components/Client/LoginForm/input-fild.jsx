import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function InputField({
    form,
    name,
    label,
    placeholder,
    type = 'text',
}) {
    return (
        <FormField
            className="w-full"
            control={form.control}
            name={name}
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="">Email address*</FormLabel>

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
