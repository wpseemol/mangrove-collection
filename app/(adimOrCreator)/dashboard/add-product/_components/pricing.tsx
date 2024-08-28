import {
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { AddProductFormType } from '@/types/add-product';
import PriceFormControl from './pricing/price-form-control';
import PriceUnitSelect from './pricing/price-unit-select';

export default function Pricing({ form }: { form: AddProductFormType }) {
    return (
        <>
            <div className="mb-4">
                <PriceUnitSelect form={form} />
            </div>
            <div className="mb-4">
                <FormField
                    control={form.control}
                    name="price"
                    render={({ field, fieldState }) => (
                        <FormItem>
                            <FormLabel className="mb-1">
                                Price variants
                            </FormLabel>
                            <FormDescription>
                                You can add different variant price.
                            </FormDescription>
                            <PriceFormControl form={form} />
                            {/* price err message here */}
                            <FormMessage>
                                {fieldState.error?.message}
                            </FormMessage>
                        </FormItem>
                    )}
                />
            </div>
        </>
    );
}
