'use client';

import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import ProductName from './product-information/product-name';

export default function ProductInformation({
    form,
}: {
    form: UseFormReturn<z.infer<typeof addProductSchema>>;
}) {
    return (
        <div className="mb-4">
            <ProductName form={form} />
        </div>
    );
}
