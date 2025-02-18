/**
 * The `CardProductType` interface defines the structure for a product.
 *
 */
export interface CardProductType {
    id: string | number;
    name: string;
    slug: string;

    /**
     * category: category _id keep here
     */
    category: string | number;
    images: Image[];
    thumbnail: string;
    /*
   
    unit: string;
    size: string;
    price: PriceType[];

    */
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
