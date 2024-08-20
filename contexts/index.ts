import { createContext, Dispatch, SetStateAction } from 'react';

interface VariantUpdateContextType {
    variantSelectId: number | null;
    setVariantSelectId: Dispatch<SetStateAction<number | null>>;
}

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

export { VariantUpdateContext };
