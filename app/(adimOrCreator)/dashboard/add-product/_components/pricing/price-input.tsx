'use client';
import { Input } from '@/components/ui/input';
import { AddProductFormType } from '@/types/add-product';
import { useEffect, useState } from 'react';

export default function PriceInput({
    form,
    onChangeValue,
}: {
    form: AddProductFormType;
    onChangeValue: (value: number) => void;
}) {
    const [inputPrice, setInputPrice] = useState<number | null>(null);

    function handelPriceInput(event: React.ChangeEvent<HTMLInputElement>) {
        if (event) {
            const value = parseFloat(event.target.value);

            onChangeValue(value);
            setInputPrice(value);
        }
    }

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setInputPrice(null);
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    return (
        <>
            <Input
                value={inputPrice ? inputPrice : ''}
                type="number"
                onChange={handelPriceInput}
                className=" bg-transparent border border-neutral-500/20
                p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                placeholder="Product price"
            />
        </>
    );
}
