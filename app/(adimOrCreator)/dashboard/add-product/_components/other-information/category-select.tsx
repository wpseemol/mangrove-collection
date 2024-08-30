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
import { AddProductFormType } from '@/types/add-product';
import { CategoryType } from '@/types/mongoose-models';
import capitalizeWord from '@/utils/capitalize-word';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function CategorySelect({
    form,
    allCategory,
}: {
    form: AddProductFormType;
    allCategory: string;
}) {
    const router = useRouter();
    const [selectedCategory, setSelectedCategory] = useState('');

    const allCategoryArray: CategoryType = JSON.parse(allCategory);

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

    function handelCategory(value: string) {
        setSelectedCategory(value);
        const selectedValue = allCategoryArray?.find(
            (category) => category.slug === value
        );

        selectedValue && form.setValue('category', selectedValue.id);
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
                        <FormLabel
                            id="product-category-select"
                            className="mb-1">
                            Category*
                        </FormLabel>
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
                                {allCategoryArray &&
                                    allCategoryArray.map((category) => (
                                        <SelectItem
                                            key={category.id}
                                            value={category.slug}>
                                            {capitalizeWord(category.name)}
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
