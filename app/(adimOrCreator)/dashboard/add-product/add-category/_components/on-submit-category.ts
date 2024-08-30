import { toast } from '@/components/ui/use-toast';
import { addCategorySchema } from '@/lib/schemas/zod/add-category-schema';
import { AddCategoryFormType } from '@/types/add-category';
import { z } from 'zod';

export default async function onSubmit(
    values: z.infer<typeof addCategorySchema>,
    obj: AdditionalObjType
) {
    const { form } = obj;

    try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        toast({ description: JSON.stringify(values) });
    } catch (error) {
        if (error instanceof Error) {
            toast({
                variant: 'destructive',
                description: error.message,
            });
        } else {
            // Handle unexpected error types
            toast({
                variant: 'destructive',
                description: 'An unexpected error occurred.',
            });
        }
    }
}

type AdditionalObjType = {
    form: AddCategoryFormType;
};
