import { createContext, Dispatch, SetStateAction } from 'react';

export const VariantUpdateContext =
    createContext<VariantUpdateContextType | null>(null);

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}

export const CartContext = createContext<CartContextType | null>(null);

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
     * cart product details here.
     * cart product object array it's.
     */
    cartProducts: CartProductType[] | null;

    /**
     * The total count of items in the cart.
     * This can be null if the cart is empty or uninitialized.
     */
    cartCount: number | null;
    cartCountLoading?: boolean;

    /**
     * cart loading state.
     * loading type can true, false.
     */
    cartProductLoading: boolean;
};
