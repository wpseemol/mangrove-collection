'use client';

import ButtonLoading from '@/components/button-loading';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Toaster } from '@/components/ui/toaster';
import { addProductSchema } from '@/lib/schemas/zod/add-product-schema';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'next-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Media from './media';
import OtherInformation from './other-information';
import Pricing from './pricing';
import ProductCategoryContainer from './product-category-container';
import ProductInformation from './product-information';
import { onSubmit } from './submit-product';
import Variants from './variants';

export default function AddProduct({
    allCategory,
    user,
}: {
    allCategory: string;
    user: User;
}) {
    const router = useRouter();

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

    useEffect(() => {
        if (form.formState.isSubmitting) {
            const isFormError = form.formState.errors;
            if (
                !!isFormError.name ||
                !!isFormError.slug ||
                !!isFormError.description
            ) {
                router.push('#product-information');
            } else if (!!isFormError.thumbnail) {
                router.push('#product-thumbnail');
            } else if (!!isFormError.currency) {
                router.push('#product-price');
            } else if (!!isFormError.category) {
                router.push('#product-outer-info');
            } else {
                router.push('');
            }
        }
    }, [form.formState.isSubmitting, form.formState.errors, router]);

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit((values) =>
                        onSubmit(values, { form, router })
                    )}
                    className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5">
                    <div className="md:col-span-2">
                        {/* product information section */}
                        <ProductCategoryContainer
                            title="Product information"
                            id="product-information">
                            <ProductInformation form={form} />
                        </ProductCategoryContainer>{' '}
                        {/* product information section */}
                        {/* product Media section */}
                        <ProductCategoryContainer title="Media" id="media">
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
                            id="product-price"
                            className="h-fit"
                            title="Pricing">
                            <Pricing form={form} />
                        </ProductCategoryContainer>
                        {/* product pricing */}

                        <ProductCategoryContainer
                            id="product-outer-info"
                            className="h-fit"
                            title="Other information">
                            <OtherInformation
                                form={form}
                                allCategory={allCategory}
                            />
                        </ProductCategoryContainer>
                    </div>
                    <section className="md:col-span-3 -mt-4">
                        <Button
                            disabled={form.formState.isSubmitting}
                            type="submit">
                            Upload
                            {form.formState.isSubmitting && <ButtonLoading />}
                        </Button>
                    </section>
                </form>
            </Form>
            <Toaster />
        </>
    );
}
