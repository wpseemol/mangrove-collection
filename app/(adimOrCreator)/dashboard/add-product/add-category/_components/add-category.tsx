'use client';

import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { addCategorySchema } from '@/lib/schemas/zod/add-category-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import NameSlugSection from './name-slug';
import ProductCategoryContainer from './product-category-container';

export default function AddCategory() {
    const form = useForm<z.infer<typeof addCategorySchema>>({
        resolver: zodResolver(addCategorySchema),
        defaultValues: {
            name: '',
            slug: '',
            imgUrl: '',
        },
    });

    async function onSubmit(values: z.infer<typeof addCategorySchema>) {
        console.log(values);
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5">
                <ProductCategoryContainer
                    className="md:col-span-2"
                    title="Category information">
                    {/* <AddCategorySection /> */}
                    <NameSlugSection form={form} />
                </ProductCategoryContainer>
                <section className="md:col-span-3 -mt-4">
                    <Button type="submit">Upload</Button>
                </section>
            </form>
        </Form>
    );
}
