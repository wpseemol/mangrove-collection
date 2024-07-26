'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

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
            price: '',
            description: '',
            thumbnail: '',
            images: [],
            variants: [],
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
                <section className="md:col-span-2 shadow border border-neutral-500/30 rounded">
                    <ProductInformation form={form} />
                </section>
                {/* product information */}
                {/* product pricing */}
                <section className="md:col-span-1 h-fit shadow border border-neutral-500/30 rounded">
                    <Pricing form={form} />
                </section>
                {/* product pricing */}
                <section className="md:col-span-2 h-fit shadow border border-neutral-500/30 rounded">
                    <Media form={form} />
                </section>
                {/* product Variants */}
                <section className="md:col-span-2 h-fit shadow border border-neutral-500/30 rounded">
                    <Variants form={form} />
                </section>
                {/* product variants */}
                <section className="md:col-span-3">
                    <Button type="submit">Submit</Button>
                </section>
            </form>
        </Form>
    );
}
