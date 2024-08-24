import mongoose from 'mongoose';
import { ProductBase } from '../mongoose-models';

// Defines types for filtering, pricing, and product details.

// `FilterSearchParamType` represents the search parameters for filtering products.
interface FilterSearchParamType {
    /**
     * Optional category filter for searching products.
     */
    category?: string; // Optional filter for product category.

    /**
     * Optional price filter for searching products, typically a price range or specific price.
     */
    price?: string; // Optional filter for price, which could be a range or specific value.

    /**
     * Optional size filter for searching products.
     */
    size?: string; // Optional filter for product size.
}

// `PriceObjType` represents an object containing minimum and maximum price values.
interface PriceObjType {
    /**
     * Minimum price for the filter. Can be `null` if not specified.
     */
    minPrice: number | null; // Minimum price value, or `null` if not specified.

    /**
     * Maximum price for the filter. Can be `null` if not specified.
     */
    maxPrice: number | null; // Maximum price value, or `null` if not specified.
}

// `ProductDetailsWith_idType` extends `ProductBase` to include a MongoDB `_id` field.
interface ProductDetailsWith_idType extends ProductBase {
    /**
     * MongoDB ObjectId for the product.
     */
    _id: mongoose.Schema.Types.ObjectId; // MongoDB ObjectId for the product.
}

// `ProductDetailsType` extends `ProductBase` to include a string `id` field.
interface ProductDetailsType extends ProductBase {
    /**
     * String identifier for the product.
     */
    id: string; // String identifier for the product.
}

export type {
    FilterSearchParamType, // Type for filtering search parameters.
    PriceObjType, // Type for minimum and maximum price.
    ProductDetailsType, // Type for product details with a string `id`.
    ProductDetailsWith_idType,
};
