import { createContext, Dispatch, SetStateAction } from 'react';

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

const CartContext = createContext<string[] | null>(null);

export { CartContext, VariantUpdateContext };
