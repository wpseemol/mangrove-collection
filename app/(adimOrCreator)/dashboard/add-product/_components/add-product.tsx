'use client';

import ButtonLoading from '@/components/button-loading';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { UserType } from '@/types/auth';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Media from './media';
import OtherInformation from './other-information';
import Pricing from './pricing';
import ProductCategoryContainer from './product-category-container';
import ProductInformation from './product-information';
import Variants from './variants';

export default function AddProduct({
    allCategory,
    user,
}: {
    allCategory: string;
    user: UserType;
}) {
    const { toast } = useToast();

    const [loading, setLoading] = useState<boolean>(false);

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
        setLoading(true);
        try {
            const response = await fetch('/api/v1/product', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(values),
            });

            const isAdd = await response.json();

            console.log(isAdd);
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

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5">
                    <div className="md:col-span-2">
                        {/* product information section */}
                        <ProductCategoryContainer title="Product information">
                            <ProductInformation form={form} />
                        </ProductCategoryContainer>{' '}
                        {/* product information section */}
                        {/* product Media section */}
                        <ProductCategoryContainer title="Media">
                            <Media form={form} />
                        </ProductCategoryContainer>
                        {/* product Media section */}
                        {/* product Variants */}
                        <ProductCategoryContainer title="Variants">
                            <Variants form={form} />
                        </ProductCategoryContainer>
                        {/* product variants */}
                    </div>
                    <div className="md:col-span-1">
                        {/* product pricing */}
                        <ProductCategoryContainer
                            className="h-fit"
                            title="Pricing">
                            <Pricing form={form} />
                        </ProductCategoryContainer>
                        {/* product pricing */}

                        <ProductCategoryContainer
                            className="h-fit"
                            title="Other information">
                            <OtherInformation
                                form={form}
                                allCategory={allCategory}
                            />
                        </ProductCategoryContainer>
                    </div>
                    <section className="md:col-span-3 -mt-4">
                        <Button disabled={loading} type="submit">
                            Upload{loading && <ButtonLoading />}
                        </Button>
                    </section>
                </form>
            </Form>
            <Toaster />
        </>
    );
}
