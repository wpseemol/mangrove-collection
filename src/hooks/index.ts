import { VariantUpdateContext } from '@/contexts';
import { useContext } from 'react';

/**
 * useVariantUpdate hook return { variantSelectId, setVariantSelectId } return
 * @returns { variantSelectId, setVariantSelectId }
 */
export const useVariantUpdate = function () {
    const context = useContext(VariantUpdateContext);

    if (!context) {
        throw new Error(
            'useVariantUpdate muse be used within a VariantUpdateProvider'
        );
    }

    const { variantSelectId, setVariantSelectId } = context;

    return { variantSelectId, setVariantSelectId };
};
