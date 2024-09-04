import { createContext, Dispatch, SetStateAction } from 'react';

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

const CartContext = createContext<CartContextType | null>(null);

export { CartContext, VariantUpdateContext };

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}

interface CartContextType {
    cartItems: string[] | null;
    setCartItem: Dispatch<SetStateAction<string[] | null>>;
}
