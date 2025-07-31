/**
 * The `CardProductType` interface defines the structure for a product.
 *
 */
export interface CardProductType {
     id: string;
     name: string;
     slug: string;

     images: Image[];
     thumbnail: string;
     price: PriceType[];
     currency: string;
     shortDescription: string; // Added this field
     category: {
          name: string; // Added this field
          slug: string; // Added this field
     };
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

/**
 * `SearchParamsType` represents the search parameters for product filtering.
 * It includes category, price, size, and search query.
 * This interface is used to define the structure of search parameters
 * that can be passed to the product filtering functions.
 * It is used in the ProductsPage component to handle product filtering.
 * This interface is also used in the ProductSection component to fetch products based on the search parameters.
 *
 */
export interface GetProductsParamsType {
     categorisIds: string[] | null;
     price: string | null;
     size: string | null;
     search: string | null;
}
