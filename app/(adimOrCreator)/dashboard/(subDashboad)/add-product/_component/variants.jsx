'use client';

import { FormControl, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useEffect, useState } from 'react';
import ErrorMassage from './error-message';

export default function Variants({ form }) {
    const [variants, setVariants] = useState([{ id: crypto.randomUUID() }]);
    const [finalSelectVariants, setFinalSelectVariants] = useState([]);

    useEffect(() => {
        if (finalSelectVariants.length > 0) {
            form.setValue('variants', finalSelectVariants);
        }
    }, [finalSelectVariants, form]);

    const productUnit = form.watch('unit');
    useEffect(() => {
        switch (productUnit) {
            case 'pc':
                setVariants([{ id: crypto.randomUUID() }]);
                form.setValue('variants', []);
                selectedValue = '';
                break;
            case 'kg':
                setVariants([{ id: crypto.randomUUID() }]);
                form.setValue('variants', []);
                selectedValue = '';
                break;
        }
    }, [productUnit, form]);

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setFinalSelectVariants([]);
                setVariants([{ id: crypto.randomUUID() }]);
                selectedValue = '';
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    function handelAddOption() {
        setVariants((pre) => [...pre, { id: crypto.randomUUID() }]);
    }

    return (
        <>
            <div className="mb-4" id="variant-section">
                <FormLabel className="mb-1">Variants</FormLabel>
                {variants.map((item) => (
                    <VariantsInput
                        key={item.id}
                        form={form}
                        id={item.id}
                        setFinalSelectVariants={setFinalSelectVariants}
                    />
                ))}

                {/* option add btn */}
                <div
                    onClick={handelAddOption}
                    className="w-fit text-sm mt-8 cursor-pointer ">
                    <p className="text-green-600 hover:text-green-700 duration-100">
                        +{' '}
                        <span className="font-medium">Add another option</span>
                    </p>
                </div>
                {/* option add btn */}
                <ErrorMassage form={form} type="variants" />
            </div>
        </>
    );
}

let selectedValue = '';
function VariantsInput({ form, id, setFinalSelectVariants }) {
    const [variantsTypes, setVariantsTypes] = useState([]);
    const [isDisable, setIsDisable] = useState(!selectedValue);
    const [type, setType] = useState(selectedValue);

    const productUnit = form.watch('unit');

    useEffect(() => {
        switch (productUnit) {
            case 'pc':
                setVariantsTypes(pcVariantsType);

                break;
            case 'kg':
                setVariantsTypes(kgVariantsType);

                break;
        }
    }, [productUnit, form]);

    function handelSelectChange(value) {
        selectedValue = value;
        setIsDisable(!selectedValue);
        setType(value);
    }

    function handelValueChange(event) {
        const variantInputValue = event.target.value;
        const obj = { id, type, title: variantInputValue };
        setFinalSelectVariants((prev) => {
            const index = prev.findIndex((item) => item?.id === id);

            if (index !== -1) {
                return prev.map((item, i) => (i === index ? obj : item));
            } else {
                return [...prev, obj];
            }
        });
    }

    return (
        <div className="grid grid-cols-3 gap-3 mb-3 last:mb-0">
            {' '}
            <TypeSelector
                variantsTypes={variantsTypes}
                handelSelectChange={handelSelectChange}
            />
            <Input
                onChange={handelValueChange}
                readOnly={isDisable}
                title={isDisable ? 'Please select variant type fist.' : ''}
                type="text"
                name="varian-title"
                id="varian-title"
                className="w-full bg-transparent border border-neutral-500/20 col-span-2
                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                placeholder="Variant title"
            />
        </div>
    );
}

function TypeSelector({ variantsTypes, handelSelectChange }) {
    return (
        <Select onValueChange={handelSelectChange} defaultValue={selectedValue}>
            <FormControl>
                <SelectTrigger
                    className="bg-transparent border border-neutral-500/20 p-2 focus:outline-none  
                    focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] col-span-1">
                    <SelectValue placeholder={`Select what type of variants`} />
                </SelectTrigger>
            </FormControl>
            <SelectContent
                className="bg-[#f0f1f7] dark:bg-[#252729] border border-neutral-500/20
                p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]">
                {variantsTypes?.map((item) => (
                    <SelectItem key={item.id} value={item.value}>
                        {item.type}
                    </SelectItem>
                ))}{' '}
            </SelectContent>
        </Select>
    );
}

// variants type array object
const pcVariantsType = [
    { id: 1, type: 'Size', value: 'size' },
    { id: 2, type: 'Color', value: 'color' },
    { id: 3, type: 'Material', value: 'material' },
    { id: 4, type: 'Style', value: 'style' },
    { id: 5, type: 'Title', value: 'title' },
];

const kgVariantsType = [{ id: 1, type: 'Size', value: 'size' }];
// variants type array object
