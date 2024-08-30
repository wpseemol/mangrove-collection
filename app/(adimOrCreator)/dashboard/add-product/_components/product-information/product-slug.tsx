'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddProductFormType } from '@/types/add-product';
import { useEffect } from 'react';

export default function ProductSlug({ form }: { form: AddProductFormType }) {
    const name = form.watch('name');
    // slug create
    useEffect(() => {
        if (name) {
            form.setValue(
                'slug',
                name
                    .trim()
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '-') // Replace non-word characters with hyphens
                    .replace(/\s+/g, '-') // Replace spaces with hyphens
                    .replace(/^-+|-+$/g, '') // Remove hyphens from the start and end
            );

            form.clearErrors('slug');
        } else {
            form.setValue('slug', '');
            form.clearErrors('slug');
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
                        <FormLabel id="product-slug" className="mb-1">
                            Product Slug*
                        </FormLabel>

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
