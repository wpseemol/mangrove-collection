import { FormLabel } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import PriceInput from './price-input';

export default function PriceFormControl({ form }) {
    const router = useRouter();

    const [variantPrice, setVariantPrice] = useState([]);

    const variants = form.watch('variants') || [];

    console.log('variant price:', variantPrice);

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
                />
                {variants?.length > 0 &&
                    variants?.map((variant) => (
                        <PriceVariant
                            key={variant?.id}
                            title={variant?.title}
                            variant={variant}
                            setVariantPrice={setVariantPrice}
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

function PriceVariant({ title, variant, setVariantPrice }) {
    useEffect(() => {
        const obj = { variantId: variant?.id, price: 0, select: true };

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

    const handleRadioChange = (event) => {
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

    function handelPriceChange(price) {
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
            <FormLabel className="mb-1 capitalize text-nowrap">
                {title} :
            </FormLabel>
            <PriceInput onChangeValue={(value) => handelPriceChange(value)} />
            <div className="w-fit border flex justify-center items-center">
                <input
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
