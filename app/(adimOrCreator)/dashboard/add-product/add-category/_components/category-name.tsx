'use client';

import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { AddCategoryFormType } from '@/types/add-category';

export default function CategoryName({ form }: { form: AddCategoryFormType }) {
    return (
        <>
            <FormField
                control={form.control}
                name="name"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Category Name*</FormLabel>

                        <FormControl>
                            <Input
                                {...field}
                                className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                placeholder="Product name"
                            />
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}
