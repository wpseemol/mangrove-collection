import {
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

export default function Pricing({ form }) {
    return (
        <>
            {' '}
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg p-3">Pricing</h2>
            </header>
            <section className="p-3">
                <div className="mb-4">
                    <FormField
                        control={form.control}
                        name="price"
                        type="number"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel className="mb-1">
                                    Regular price*
                                </FormLabel>

                                <FormControl>
                                    <Input
                                        type="number"
                                        {...field}
                                        className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                        placeholder="Product price"
                                    />
                                </FormControl>
                                <FormMessage>
                                    {fieldState.error?.message}
                                </FormMessage>
                            </FormItem>
                        )}
                    />
                </div>
            </section>
        </>
    );
}
