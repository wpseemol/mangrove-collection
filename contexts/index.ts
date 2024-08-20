import { createContext, Dispatch, SetStateAction } from 'react';

interface VariantUpdateContextType {
    variantSelectId: string;
    setVariantSelectId: Dispatch<SetStateAction<string>>;
}

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

export { VariantUpdateContext };
