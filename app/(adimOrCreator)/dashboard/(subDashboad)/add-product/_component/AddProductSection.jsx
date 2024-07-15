'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import 'react-quill/dist/quill.snow.css';
import Description from './Description';
import { formSchema } from './formSchema';

export default function AddProductSection() {
    const router = useRouter();

    const [descriptionValue, setDescriptionValue] = useState('');

    const form = useForm({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: '',
            slug: '',
            unit: 'pc',
            price: '',
            description: '',
        },
    });

    const name = form.watch('name');

    // slug create
    useEffect(() => {
        if (name) {
            form.setValue(
                'slug',
                name
                    .toLowerCase()
                    .replace(/[^\w\s-]/g, '-')
                    .replace(/\s+/g, '-')
            );
        } else {
            form.setValue('slug', '');
        }

        if (descriptionValue) {
            form.setValue('description', descriptionValue);
        }
    }, [form, name, descriptionValue]);
    // slug create

    function onSubmit(values) {
        console.log(values);
        form.reset();
        setDescriptionValue('');
    }

    return (
        <Form {...form}>
            <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid md:grid-cols-3 grid-cols-1 gap-4">
                <section className="md:col-span-2 shadow border border-neutral-500/30 rounded">
                    <header className="border-b border-neutral-500/30">
                        <h2 className="font-semibold text-lg p-3">
                            Product information
                        </h2>
                    </header>

                    <section className="p-3">
                        <div className="mb-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="mb-1">
                                            Product Name*
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                {...field}
                                                className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                                placeholder="Product name"
                                            />
                                        </FormControl>
                                        <FormMessage>
                                            {fieldState.error?.message}
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="mb-4 grid grid-cols-3 gap-3">
                            <div className="col-span-2">
                                <FormField
                                    control={form.control}
                                    name="slug"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="mb-1">
                                                Product Slug*
                                            </FormLabel>

                                            <FormControl>
                                                <Input
                                                    {...field}
                                                    className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                                    placeholder="product-slug-example"
                                                />
                                            </FormControl>
                                            <FormMessage>
                                                {fieldState.error?.message}
                                            </FormMessage>
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="mb-4">
                                <FormField
                                    control={form.control}
                                    name="unit"
                                    render={({ field, fieldState }) => (
                                        <FormItem>
                                            <FormLabel className="mb-1">
                                                Unit
                                            </FormLabel>
                                            <Select
                                                onValueChange={field.onChange}
                                                defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger
                                                        className="bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                                                        <SelectValue
                                                            placeholder={`Product unit ${field.value} selected`}
                                                        />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent
                                                    className="bg-[#f0f1f7] dark:bg-[#252729]
                                                border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]
                                                ">
                                                    <SelectItem value="kg">
                                                        KG
                                                    </SelectItem>
                                                    <SelectItem value="pc">
                                                        PC
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>
                        <div className="h-[25rem]">
                            <FormLabel className="mb-1">Description*</FormLabel>

                            <Description
                                descriptionValue={descriptionValue}
                                setDescriptionValue={setDescriptionValue}
                            />
                        </div>
                    </section>
                </section>

                <section className="md:col-span-1 h-fit shadow border border-neutral-500/30 rounded">
                    <header className="border-b border-neutral-500/30">
                        <h2 className="font-semibold text-lg p-3">Pricing</h2>
                    </header>
                    <section className="p-3">
                        <div className="mb-4">
                            <FormField
                                control={form.control}
                                name="price"
                                type="number"
                                render={({ field, fieldState }) => (
                                    <FormItem>
                                        <FormLabel className="mb-1">
                                            Regular price*
                                        </FormLabel>

                                        <FormControl>
                                            <Input
                                                type="number"
                                                {...field}
                                                className="w-full bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                                                placeholder="Product price"
                                            />
                                        </FormControl>
                                        <FormMessage>
                                            {fieldState.error?.message}
                                        </FormMessage>
                                    </FormItem>
                                )}
                            />
                        </div>
                    </section>
                </section>

                <section className="md:col-span-3">
                    <Button type="submit">Submit</Button>
                </section>
            </form>
        </Form>
    );
}
