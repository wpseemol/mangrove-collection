'use client';
import { FormLabel } from '@/components/ui/form';
import { AddProductFormType } from '@/types/add-product';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PriceInput from './price-input';

export default function PriceFormControl({
    form,
}: {
    form: AddProductFormType;
}) {
    const router = useRouter();

    const [variantPrice, setVariantPrice] = useState<VariantPriceType[]>([]);

    const variants: VariantType[] = form.watch('variants') || [];

    useEffect(() => {
        if (variantPrice.length > 0) {
            form.setValue('price', variantPrice);
        }
    }, [variantPrice, form]);

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                const obj: VariantPriceType = {
                    variantId: variantDefault.id,
                    price: 0,
                    select: true,
                };
                setVariantPrice([obj]);
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    function handelAddVariant() {
        router.push('#variant-section');
    }
    return (
        <div className="">
            <>
                <PriceVariant
                    title="regular"
                    variant={variantDefault}
                    setVariantPrice={setVariantPrice}
                    form={form}
                />
                {variants?.length > 0 &&
                    variants?.map((variant) => (
                        <PriceVariant
                            key={variant?.id}
                            title={variant?.title}
                            variant={variant}
                            setVariantPrice={setVariantPrice}
                            form={form}
                        />
                    ))}
            </>

            <div className="w-full mt-4">
                <p
                    onClick={handelAddVariant}
                    className=" w-fit cursor-pointer text-green-600 hover:text-green-700 duration-100 font-medium">
                    <span className="font-thin">+</span> Add variant
                </p>
            </div>
        </div>
    );
}

type PriceVariantType = {
    form: AddProductFormType;
    setVariantPrice: React.Dispatch<React.SetStateAction<VariantPriceType[]>>;
    title: string;
    variant: VariantType;
};

function PriceVariant({
    form,
    title,
    variant,
    setVariantPrice,
}: PriceVariantType) {
    useEffect(() => {
        const obj = {
            variantId: variant?.id,
            price: 0,
            select: variant?.id === 'regular',
        };

        setVariantPrice((prev) => {
            const isVariantIdUnique = !prev.some(
                (item) => item.variantId === variant?.id
            );
            if (isVariantIdUnique) {
                return [...prev, obj];
            }
            return prev;
        });
    }, [variant?.id, setVariantPrice]);

    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setVariantPrice((prev) => {
            const updateValue = prev.map((item) => {
                if (item?.variantId === variant?.id) {
                    return { ...item, select: event.target.checked };
                } else {
                    return { ...item, select: false };
                }
            });
            return updateValue;
        });
    };

    function handelPriceChange(price: number) {
        setVariantPrice((prev) => {
            const updateValue = prev.map((item) => {
                if (item?.variantId === variant?.id) {
                    return { ...item, price };
                } else {
                    return item;
                }
            });
            return updateValue;
        });
    }

    return (
        <div className="w-full flex items-center gap-4 mt-2">
            <FormLabel className="mb-1 capitalize text-nowrap font-thin">
                {title} :
            </FormLabel>
            <PriceInput
                form={form}
                onChangeValue={(value: number) => handelPriceChange(value)}
            />
            <div className="w-fit flex justify-center items-center">
                <input
                    title="This price show is product card."
                    defaultChecked={variant?.id === 'regular'}
                    onChange={handleRadioChange}
                    type="radio"
                    name="price"
                    id={variant?.id}
                />
            </div>
        </div>
    );
}

const variantDefault = {
    id: 'regular',
    type: 'regular',
    title: 'Regular',
};

type VariantType = {
    type: string;
    id: string;
    title: string;
};

type VariantPriceType = {
    variantId: string;
    price: number;
    select: boolean;
};
