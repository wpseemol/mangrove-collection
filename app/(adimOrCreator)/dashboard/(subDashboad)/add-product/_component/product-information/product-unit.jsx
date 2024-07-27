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

export default function ProductUnit({ form }) {
    return (
        <>
            <FormField
                control={form.control}
                name="unit"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="mb-1">Unit</FormLabel>
                        <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}>
                            <FormControl>
                                <SelectTrigger
                                    className="bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                                    <SelectValue
                                        placeholder={`Product unit ${field.value} selected`}
                                    />
                                </SelectTrigger>
                            </FormControl>
                            <SelectContent
                                className="bg-[#f0f1f7] dark:bg-[#252729]
                                                border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
                                                ">
                                <SelectItem value="kg">KG</SelectItem>
                                <SelectItem value="pc">PC</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormItem>
                )}
            />
        </>
    );
}
