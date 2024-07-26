import {
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import PriceFormControl from './pricing/price-form-control';
import PriceUnitSelect from './pricing/price-unit-select';

export default function Pricing({ form }) {
    return (
        <>
            {' '}
            <header className="border-b border-neutral-500/30">
                <h2 className="font-semibold text-lg p-3">Pricing</h2>
            </header>
            <section className="p-3">
                <div className="mb-4">
                    <PriceUnitSelect form={form} />
                </div>

                <div className="mb-4">
                    <FormField
                        control={form.control}
                        name="price"
                        type="number"
                        render={({ field, fieldState }) => (
                            <FormItem>
                                <FormLabel className="mb-1">
                                    Price variants
                                </FormLabel>
                                <PriceFormControl form={form} />
                                {/* price err message here */}
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
