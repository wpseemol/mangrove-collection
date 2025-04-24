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
    cartSelectedProducts: CartSelectedProductsType[] | null;
    setCartSelectedProducts: Dispatch<
        SetStateAction<CartSelectedProductsType[] | null>
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

interface CartSelectedProductsType {
    id: string;
    quantity: number;
    currency: string;
    price: number;
}

export const PurchaseContext = createContext<PurchaseContextType | null>(null);

interface PurchaseContextType {
    paymentMethod: PaymentMethod | null;
    setPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
    shippingCost: number | null;
    setShippingCost: Dispatch<SetStateAction<number | null>>;
    buyProducts: Products[] | null;
    setBuyProducts: Dispatch<SetStateAction<Products[] | null>>;
}

interface Products {
    productId: string;
    quantity: number;
}

type PaymentMethod = 'cod' | 'online-payment' | 'card';
