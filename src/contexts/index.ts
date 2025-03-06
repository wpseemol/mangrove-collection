import { createContext, Dispatch, SetStateAction } from 'react';

export const VariantUpdateContext =
    createContext<VariantUpdateContextType | null>(null);

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}
