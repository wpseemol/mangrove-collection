'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import ProductCategoryContainer from '@/components/dashboard-container/product-category-container';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import 'react-quill/dist/quill.snow.css';
import { formSchema } from './form-schema';
import Media from './media';
import Pricing from './pricing';
import ProductInformation from './product-information';
import Variants from './variants';

export default function AddProductSection() {
    const router = useRouter();

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
        },
    });

    function onSubmit(values) {
        console.log(values);
        form.reset();
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid md:grid-cols-3 grid-cols-1 gap-4">
                {/* product information */}
                <ProductCategoryContainer title="Product information">
                    <ProductInformation form={form} />
                </ProductCategoryContainer>

                {/* product information */}
                {/* product pricing */}
                <ProductCategoryContainer
                    className="md:col-span-1 h-fit"
                    title="Pricing">
                    <Pricing form={form} />
                </ProductCategoryContainer>
                {/* product pricing */}

                <ProductCategoryContainer title="Media">
                    <Media form={form} />
                </ProductCategoryContainer>

                {/* product Variants */}
                <ProductCategoryContainer title="Variants">
                    <Variants form={form} />
                </ProductCategoryContainer>
                {/* product variants */}
                <section className="md:col-span-3">
                    <Button type="submit">Submit</Button>
                </section>
            </form>
        </Form>
    );
}
