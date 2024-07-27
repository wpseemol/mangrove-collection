'use client';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import capitalizeWord from '@/utils/capitalizeWords';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CategorySelect({ form, allCategory }) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('');

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setSelectedCategory('');
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    function handelCategory(value) {
        setSelectedCategory(value);
        const selectedValue = allCategory?.find(
            (category) => category.categorySlug === value
        );

        form.setValue('category', selectedValue?.id);
        form.clearErrors('category');
    }

    function handelAddCategory() {
        router.push('/dashboard/add-product/add-category');
    }

    return (
        <>
            <FormField
                control={form.control}
                name="category"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Category*</FormLabel>
                        <Select
                            onValueChange={handelCategory}
                            value={selectedCategory}>
                            <FormControl>
                                <SelectTrigger
                                    className="bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                                    <SelectValue
                                        placeholder={`Please select category`}
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent
                                className="bg-[#f0f1f7] dark:bg-[#252729]
                                                border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
                                                ">
                                {allCategory?.length > 0 &&
                                    allCategory?.map((category) => (
                                        <SelectItem
                                            key={category?.id}
                                            value={category?.categorySlug}>
                                            {capitalizeWord(
                                                category?.categoryName
                                            )}
                                        </SelectItem>
                                    ))}
                            </SelectContent>
                        </Select>

                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />

            <div className="w-full mt-4">
                <p
                    onClick={handelAddCategory}
                    className=" w-fit cursor-pointer text-green-600 hover:text-green-700 duration-100 font-medium">
                    <span className="font-thin">+</span> Add category
                </p>
            </div>
        </>
    );
}
