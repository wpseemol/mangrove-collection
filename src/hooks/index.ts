import {
    CartContext,
    CartProductsContext,
    PurchaseContext,
    VariantUpdateContext,
} from '@/contexts';
import { useContext } from 'react';

/**
 * useVariantUpdate hook return { variantSelectId, setVariantSelectId } return
 * @returns { variantSelectId, setVariantSelectId }
 */
export const useVariantUpdate = function () {
    const context = useContext(VariantUpdateContext);

    if (!context) {
        throw new Error(
            'useVariantUpdate muse be used within a VariantUpdateProvider'
        );
    }

    const { variantSelectId, setVariantSelectId } = context;

    return { variantSelectId, setVariantSelectId };
};

/**
 * useCart hook pass cart item use {cart, setCart} object.
 * @returns {cart, setCart}
 */
export const useCart = function () {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart muse be used within a CartProvider');
    }

    return context;
};

/**
 * useCartProducts hook pass cart item use `{loading,setLoading,cartProducts,setCartProducts, cartSelectedProducts, setCartSelectedProducts}` object.
 * @returns {loading,setLoading,cartProducts,setCartProducts}
 */
export const useCartProducts = function () {
    const context = useContext(CartProductsContext);

    if (!context) {
        throw new Error(
            'useCartProducts muse be used within a CartProductsContext'
        );
    }

    return context;
};

/**
 * usePurchase hook pass cart item use `{buyProducts,setBuyProducts,shippingCost,setShippingCost,paymentMethod, setPaymentMethod}`object.
 * @returns {buyProducts,setBuyProducts,shippingCost,setShippingCost,paymentMethod, setPaymentMethod}
 */
export const usePurchase = function () {
    const context = useContext(PurchaseContext);

    if (!context) {
        throw new Error('usePurchase muse be used within a CartProvider');
    }

    return context;
};
