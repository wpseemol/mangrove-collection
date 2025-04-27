/**
 * @description PurchaseItemType is used to define the structure of a purchase item.
 * @property {string} productId - The ID of the product being purchased.
 * @property {number} quantity - The quantity of the product being purchased.
 * @property {string} selectePriceId - The selected price ID for the product.
 */
export interface PurchaseItemType {
     productId: string;
     quantity: number;
     selectePriceId: string;
}

/**
 * @description PurchaseProductsType is used to define the structure of a purchase product.
 * @property {string} id - The ID of the product.
 * @property {string} name - The name of the product.
 * @property {string} thumbnail - The thumbnail image URL of the product.
 * @property {string} slug - The slug of the product.
 * @property {string} currency - The currency of the product price.
 * @property {number} price - The price of the product.
 * @property {number} quantity - The quantity of the product purchased.
 * @property {string} selectePriceId - The selected price ID for the product.
 */
export interface PurchaseProductsType {
     id: string;
     name: string;
     thumbnail: string;
     slug: string;
     currency: string;
     price: number;
     quantity: number;
     selectePriceId: string;
}

/**
 * @description ProductType is used to define the structure of a product.
 * @property {string} id - The ID of the product.
 * @property {string} name - The name of the product.
 * @property {string} slug - The slug of the product.
 * @property {string} currency - The currency of the product price.
 * @property {string} thumbnail - The thumbnail image URL of the product.
 * @property {PriceType[]} price - An array of price variants for the product.
 * @property {string} price.variantId - The ID of the price variant.
 * @property {number} price.price - The price of the variant.
 * @property {boolean} price.select - Indicates if the variant is selected.
 *
 */
export interface ProductType {
     id: string;
     name: string;
     slug: string;
     currency: string;
     thumbnail: string;
     price: PriceType[];
}

/**
 * @description PriceType is used to define the structure of a price variant.
 * @property {string} variantId - The ID of the price variant.
 * @property {number} price - The price of the variant.
 * @property {boolean} select - Indicates if the variant is selected.
 */
interface PriceType {
     variantId: string;
     price: number;
     select: boolean;
}
