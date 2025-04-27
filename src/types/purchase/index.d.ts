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
