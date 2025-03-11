import { createContext, Dispatch, SetStateAction } from 'react';

export const VariantUpdateContext =
    createContext<VariantUpdateContextType | null>(null);

interface VariantUpdateContextType {
    variantSelectId: string | null;
    setVariantSelectId: Dispatch<SetStateAction<string | null>>;
}

export const CartContext = createContext<CartType | null>(null);

export type CartType = {
    cart: Cart;
    setCart: Dispatch<SetStateAction<Cart>>;
};

interface Cart {
    cartCount: number | null;
    cartProductIds: string[];
}

export const PurchaseContext = createContext<PurchaseContextType | null>(null);

interface PurchaseContextType {
    buyProducts: Products[] | null;
    setBuyProducts: Dispatch<SetStateAction<Products[] | null>>;
}

interface Products {
    productId: string | number;
    quantity: number;
}
