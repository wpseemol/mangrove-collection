/**
 * The `CardProductType` interface defines the structure for a product.
 *
 */
export interface CardProductType {
    id: string | number;
    name: string;
    slug: string;

    images: Image[];
    thumbnail: string;
    price: PriceType[];
    currency: string;
}

/**
 * The `PriceType` interface defines the structure for product pricing.
 * - `variantId`: The identifier for the specific variant.
 * - `price`: The price of the variant.
 * - `select`: Boolean indicating if this variant is selected.
 */
export interface PriceType {
    /**
     * Identifier for the variant.
     */
    variantId: string;

    /**
     * Price for the variant.
     */
    price: number;

    /**
     * Indicates if the variant is selected.
     */
    select: boolean;
}

/**
 * `Image` interface is type of Image
 * - `id` string and number.
 * - `imgUrl` string.
 */
export interface Image {
    id: string | number;
    imgUrl: string;
}

/**
 * `FilterSearchParamType` represents the search parameters for filtering products.
 */
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
