import { FormLabel } from '@/components/ui/form';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import PriceInput from './price-input';
import PriceUnitSelect from './price-unit-select';

export default function PriceFormControl({ form }) {
    const router = useRouter();

    const [variantPrice, setVariantPrice] = useState([
        { variantId: 'regular', price: 0, select: false },
    ]);

    const variants = form.watch('variants') || [];

    console.log(variants);

    function handelAddVariant() {
        router.push('#variant-section');
    }
    return (
        <div className="w-full flex flex-col items-center">
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

            <PriceUnitSelect />
        </div>
    );
}

function PriceVariant({ title, variant, setVariantPrice }) {
    const [selectedValue, setSelectedValue] = useState('show');

    console.log(variant);

    const handleRadioChange = (event) => {
        console.log(setVariantPrice, event.target.checked);

        setVariantPrice((pre) => []);
    };
    return (
        <div className="w-full flex items-center gap-4 mt-2">
            <FormLabel className="mb-1 w-2/5 capitalize">{title} :</FormLabel>
            <PriceInput />
            <div className="w-fit border">
                <input
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
