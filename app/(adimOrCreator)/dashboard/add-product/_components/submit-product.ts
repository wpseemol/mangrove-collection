// submitProduct.ts
import { toast } from '@/components/ui/use-toast';
import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { AddProductFormType } from '@/types/add-product';
import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime';
import { z } from 'zod';

export async function onSubmit(
    values: z.infer<typeof addProductSchema>,
    obj: AdditionalObjType
) {
    const { form, router, setLoading } = obj;

    setLoading(true);
    try {
        const response = await fetch('/api/v1/product', {
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
                router.push('#product-slug');
            } else {
                throw new Error(error.message);
            }

            return;
        }

        const isAdd = await response.json();
        toast({
            variant: 'success',
            description: isAdd.message,
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
    } finally {
        setLoading(false);
    }
}

type AdditionalObjType = {
    form: AddProductFormType;
    router: AppRouterInstance;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};
