import { CartProductType, OrderSummary } from '@/types/cart';
import { ShippingContextType } from '@/types/shipping';
import { createContext, Dispatch, SetStateAction } from 'react';

const VariantUpdateContext = createContext<VariantUpdateContextType | null>(
    null
);

const CartContext = createContext<CartContextType | null>(null);

const ShippingContext = createContext<ShippingContextType | null>(null);

export { CartContext, ShippingContext, VariantUpdateContext };

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}

interface CartContextType {
    cart: CartType;
    setCart: Dispatch<SetStateAction<CartType>>;
    orderSummary: null | OrderSummary[];
    setOrderSummary: Dispatch<SetStateAction<null | OrderSummary[]>>;
    rowSelection: {};
    setRowSelection: Dispatch<SetStateAction<{}>>;
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
