import { toast } from '@/components/ui/use-toast';
import { addCategorySchema } from '@/lib/schemas/zod/add-category-schema';
import { AddCategoryFormType } from '@/types/add-category';
import { z } from 'zod';

export default async function onSubmit(
    values: z.infer<typeof addCategorySchema>,
    obj: AdditionalObjType
) {
    toast({
        variant: 'success',
        description: JSON.stringify(values),
    });
}

type AdditionalObjType = {
    form: AddCategoryFormType;
};
