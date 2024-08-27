'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { UserType } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import ProductCategoryContainer from './product-category-container';
import ProductInformation from './product-information';

export default function AddProduct({
    allCategory,
    user,
}: {
    allCategory: string;
    user: UserType;
}) {
    // console.log(allCategory);

    const form = useForm<z.infer<typeof addProductSchema>>({
        resolver: zodResolver(addProductSchema),
        defaultValues: {
            name: '',
            slug: '',
            unit: 'pc',
            description: '',
            thumbnail: '',
            images: [],
            variants: [],
            currency: '',
            price: [{ variantId: 'regular', price: 0, select: true }],
            category: '',
            shortDescription: '',
            tags: [],
        },
    });

    async function onSubmit(values: z.infer<typeof addProductSchema>) {
        console.log(values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5">
                <div className="md:col-span-2">
                    <ProductCategoryContainer title="Product information">
                        <ProductInformation form={form} />
                    </ProductCategoryContainer>{' '}
                </div>
                <div className="md:col-span-1"></div>
                <section className="md:col-span-3 -mt-4">
                    <Button type="submit">Submit</Button>
                </section>
            </form>
        </Form>
    );
}
