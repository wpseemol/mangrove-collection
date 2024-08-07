'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import addProductAction from '@/app/actions/addProductAction/addProductAction';
import ProductCategoryContainer from '@/components/dashboard-container/product-category-container';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { ToastAction } from '@/components/ui/toast';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';
import 'react-quill/dist/quill.snow.css';
import { formSchema } from './form-schema';
import Media from './media';
import OtherInformation from './other-information';
import Pricing from './pricing';
import ProductInformation from './product-information';
import Variants from './variants';

export default function AddProductSection({ allCategory }) {
    const router = useRouter();
    const { toast } = useToast();

    const form = useForm({
        resolver: zodResolver(formSchema),
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

    async function onSubmit(values) {
        try {
            const isProductAdd = await addProductAction(values);
            if (isProductAdd === 'created') {
                toast({
                    variant: 'success',
                    description: 'The product has been created successfully',
                });
                form.reset();
            }
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Uh oh! Something went wrong.',
                description: error?.message,
                action: (
                    <ToastAction altText="Try again">Try again</ToastAction>
                ),
            });
        }
    }

    return (
        <>
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="grid md:grid-cols-3 grid-cols-1 gap-4">
                    <div className="md:col-span-2">
                        {/* product information */}
                        <ProductCategoryContainer title="Product information">
                            <ProductInformation form={form} />
                        </ProductCategoryContainer>
                        {/* product information */}

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
                        {/* product pricing */}
                        <ProductCategoryContainer
                            className="h-fit"
                            title="Other information">
                            <OtherInformation
                                form={form}
                                allCategory={allCategory}
                            />
                        </ProductCategoryContainer>
                        {/* product pricing */}
                    </div>

                    <section className="md:col-span-3 -mt-4">
                        <Button type="submit">Submit</Button>
                    </section>
                </form>
            </Form>

            <Toaster />
        </>
    );
}
