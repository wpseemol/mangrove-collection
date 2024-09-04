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
    cart: CartType;
    setCart: Dispatch<SetStateAction<CartType>>;
}

export type CartType = {
    /**
     * The items currently in the cart, represented by an array of item IDs.
     * This can be null if the cart is empty or uninitialized.
     */
    cartItems: string[] | null;

    /**
     * The total count of items in the cart.
     * This can be null if the cart is empty or uninitialized.
     */
    cartCount: number | null;
};
