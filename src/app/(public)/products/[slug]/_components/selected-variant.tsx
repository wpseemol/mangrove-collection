'use client';

import { useVariantUpdate } from '@/hooks';
import { useEffect } from 'react';

interface SelectedVariantType {
    type: string;
    variants?: VariantsType[];
    displayPrice?: PriceType;
}

export default function SelectedVariant({
    type,
    variants,
    displayPrice,
}: SelectedVariantType) {
    const { variantSelectId, setVariantSelectId } = useVariantUpdate();

    const typeVariants = variants?.filter((variant) => variant?.type === type);

    function handelSelectVariant(selectedId: string) {
        setVariantSelectId(selectedId);
    }

    useEffect(() => {
        if (displayPrice?.variantId) {
            setVariantSelectId(displayPrice?.variantId);
        }
    }, [displayPrice?.variantId, setVariantSelectId]);

    return typeVariants?.map((variant) => (
        <button
            onClick={() => handelSelectVariant(variant?.id)}
            key={variant?.id}
            className={`${
                variant?.id === variantSelectId
                    ? 'bg-primary-foreground text-white hover:bg-primary'
                    : 'bg-neutral-300/60 text-neutral-600'
            } duration-150 py-1 px-2 rounded capitalize
                    cursor-pointer`}>
            {variant?.title}
        </button>
    ));
}

interface PriceType {
    variantId: string;
    price: number;
    select: boolean;
}

interface VariantsType {
    id: string;
    type: string;
    title: string;
}
