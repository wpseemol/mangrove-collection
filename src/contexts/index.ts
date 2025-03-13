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

export const CartProductsContext =
    createContext<CartProductsContextType | null>(null);

interface CartProductsContextType {
    loading: boolean;
    setLoading: Dispatch<SetStateAction<boolean>>;
    cartProducts: CartProductsType[] | null;
    setCartProducts: Dispatch<SetStateAction<CartProductsType[] | null>>;
    cartSelectedPrducts: CartSelectedPrductsType[];
    setCartSelectedProducts: Dispatch<
        SetStateAction<CartSelectedPrductsType[] | null>
    >;
}

interface CartProductsType {
    quantity: number;
    price: number;
    slug: string;
    id: string;
    currency: string;
    name: string;
    thumbnail: string;
}

interface CartSelectedPrductsType {
    id: string;
    quantity: number;
    currency: string;
    price: number;
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
