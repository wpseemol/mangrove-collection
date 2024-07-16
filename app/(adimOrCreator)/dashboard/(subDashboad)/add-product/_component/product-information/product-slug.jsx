import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useEffect } from 'react';

export default function ProductSlug({ form }) {
    const name = form.watch('name');
    // slug create
    useEffect(() => {
        if (name) {
            form.setValue(
                'slug',
                name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '-')
                    .replace(/\s+/g, '-')
            );
        } else {
            form.setValue('slug', '');
        }
    }, [form, name]);
    // slug create

    return (
        <>
            <FormField
                control={form.control}
                name="slug"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Product Slug*</FormLabel>

                        <FormControl>
                            <Input
                                {...field}
                                className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                placeholder="product-slug-example"
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}
