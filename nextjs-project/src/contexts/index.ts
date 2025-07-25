import { CartProductsType } from "@/lib/actions/cart";
import { createContext, Dispatch, SetStateAction } from "react";

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

interface CartSelectedProductsType {
     id: string;
     quantity: number;
     currency: string;
     price: number;
     selectedPriceId: string;
}

export const PurchaseContext = createContext<PurchaseContextType | null>(null);

interface PurchaseContextType {
     paymentMethod: PaymentMethod | null;
     setPaymentMethod: Dispatch<SetStateAction<PaymentMethod | null>>;
     shippingCost: number | null;
     setShippingCost: Dispatch<SetStateAction<number | null>>;
     buyProducts: PurchaseProducts[] | null;
     setBuyProducts: Dispatch<SetStateAction<PurchaseProducts[] | null>>;
}

/**
 * @description Products is used to define the structure of a product in the purchase context.
 * @property {string} productId - The ID of the product.
 * @property {number} quantity - The quantity of the product purchased.
 * @property {string} selectedPriceId - The selected price ID for the product.
 */
export interface PurchaseProducts {
     productId: string;
     quantity: number;
     selectedPriceId: string;
}

export type PaymentMethod = "cod" | "online-payment" | "card";
