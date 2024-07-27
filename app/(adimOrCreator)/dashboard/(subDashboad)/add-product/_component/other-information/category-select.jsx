'use client';
import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from '@/components/ui/form';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import capitalizeWord from '@/utils/capitalizeWords';

export default function CategorySelect({ form, allCategory }) {
    console.log(allCategory);

    return (
        <FormField
            control={form.control}
            name="category"
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="mb-1">Category*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
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
                                        {capitalizeWord(category?.categoryName)}
                                    </SelectItem>
                                ))}
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
}
