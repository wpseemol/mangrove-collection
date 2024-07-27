import { FormField, FormItem, FormMessage } from '@/components/ui/form';

export default function ErrorMassage({ form, type }) {
    return (
        <>
            <FormField
                control={form.control}
                name={type}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}
