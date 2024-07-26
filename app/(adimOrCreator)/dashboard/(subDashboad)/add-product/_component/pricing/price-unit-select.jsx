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

export default function PriceUnitSelect({ form }) {
    return (
        <FormField
            control={form.control}
            name="currency"
            render={({ field, fieldState }) => (
                <FormItem>
                    <FormLabel className="mb-1">Currency*</FormLabel>
                    <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                            <SelectTrigger
                                className="bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                                <SelectValue
                                    placeholder={`Please select price currency.`}
                                />
                            </SelectTrigger>
                        </FormControl>
                        <SelectContent
                            className="bg-[#f0f1f7] dark:bg-[#252729]
                                                border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
                                                ">
                            <SelectItem value="taka">&#2547; টাকা</SelectItem>
                            <SelectItem value="dollar">&#36; Dollar</SelectItem>
                        </SelectContent>
                    </Select>
                </FormItem>
            )}
        />
    );
}
