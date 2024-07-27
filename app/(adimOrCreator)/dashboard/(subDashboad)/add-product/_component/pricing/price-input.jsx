'use client';
import { Input } from '@/components/ui/input';
import { useEffect, useState } from 'react';

export default function PriceInput({ form, onChangeValue }) {
    const [inputPrice, setInputPrice] = useState('');

    function handelPriceInput(event) {
        onChangeValue(parseInt(event.target.value));
        setInputPrice(parseInt(event.target.value));
    }

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setInputPrice('');
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    return (
        <>
            <Input
                value={inputPrice}
                type="number"
                onChange={handelPriceInput}
                className=" bg-transparent border border-neutral-500/20
                p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                placeholder="Product price"
            />
        </>
    );
}
