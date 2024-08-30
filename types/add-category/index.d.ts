import { addCategorySchema } from '@/lib/schemas/zod/add-category-schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';

export type AddCategoryFormType = UseFormReturn<
    z.infer<typeof addCategorySchema>
>;
