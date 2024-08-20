import { createContext, Dispatch, SetStateAction } from 'react';

interface VariantUpdateContextType {
    variantSelectId: number;
    setVariantSelectId: Dispatch<SetStateAction<number>>;
}

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

export { VariantUpdateContext };
