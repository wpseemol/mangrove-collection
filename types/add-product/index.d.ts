import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export type AddProductFormType = UseFormReturn<
    z.infer<typeof addProductSchema>
>;
