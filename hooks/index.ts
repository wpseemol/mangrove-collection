import { CartContext, ShippingContext, VariantUpdateContext } from '@/contexts';
import { useContext } from 'react';

/**
 * useVariantUpdate hook return { variantSelectId, setVariantSelectId } return
 * @returns { variantSelectId, setVariantSelectId }
 */
const useVariantUpdate = function () {
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
const useCart = function () {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart muse be used within a CartProvider');
    }

    return context;
};

const useShipping = function () {
    const context = useContext(ShippingContext);
    if (!context) {
        throw new Error('useCart muse be used within a CartProvider');
    }

    return context;
};

export { useCart, useShipping, useVariantUpdate };
