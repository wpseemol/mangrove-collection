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
        const response = await fetch('/api/v1/category', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(values),
        });

        if (!response.ok) {
            const error = await response.json();
            if (error.pattern === 'slug') {
                form.setError('slug', {
                    type: 'required',
                    message: error.message,
                });
            } else {
                throw new Error(error.message);
            }
            return;
        }

        const isAddCategory = await response.json();
        toast({
            variant: 'success',
            description: isAddCategory.message,
        });

        form.reset();
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
