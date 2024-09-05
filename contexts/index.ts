import { CartProductType } from '@/types/cart';
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
     * cart product details here.
     * cart product object array it's.
     */
    cartProducts: CartProductType[] | null;

    /**
     * The total count of items in the cart.
     * This can be null if the cart is empty or uninitialized.
     */
    cartCount: number | null;

    /**
     * cart loading state.
     * loading type can true, false.
     */
    loading: boolean;
};
