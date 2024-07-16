import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import Description from './description';
import ProductSlug from './produt-slug';

export default function ProductInformation({ form }) {
    return (
        <>
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg p-3">
                    Product information
                </h2>
            </header>

            <section className="p-3">
                <div className="mb-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel className="mb-1">
                                    Product Name*
                                </FormLabel>

                                <FormControl>
                                    <Input
                                        {...field}
                                        className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                        placeholder="Product name"
                                    />
                                </FormControl>
                                <FormMessage>
                                    {fieldState.error?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="mb-4 grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                        <ProductSlug form={form} />
                    </div>

                    <div className="mb-4">
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
                                            <SelectItem value="kg">
                                                KG
                                            </SelectItem>
                                            <SelectItem value="pc">
                                                PC
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </FormItem>
                            )}
                        />
                    </div>
                </div>
                <div className="">
                    <Description form={form} />
                </div>
            </section>
        </>
    );
}
