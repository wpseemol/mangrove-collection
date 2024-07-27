'use client';

import { useVariantUpdate } from '@/app/hooks';

export default function SelectedVariant({ type, variants }) {
    const { variantSelectId, setVariantSelectId } = useVariantUpdate();

    const typeVariants = variants?.filter((variant) => variant?.type === type);

    function handelSelectVariant(selectedId) {
        setVariantSelectId(selectedId);
    }

    return (
        <>
            {typeVariants?.map((variant) => (
                <button
                    onClick={() => handelSelectVariant(variant?.id)}
                    key={variant?.id}
                    className={`${
                        variant?.id === variantSelectId
                            ? 'bg-primaryColor/60'
                            : 'bg-neutral-300/60'
                    } duration-150 py-1 px-2 rounded text-neutral-600 capitalize
                    cursor-pointer`}>
                    {variant?.title}
                </button>
            ))}
        </>
    );
}
