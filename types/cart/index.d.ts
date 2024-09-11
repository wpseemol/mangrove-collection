import { Row } from '@tanstack/react-table';

/**
 * Represents a product in the cart.
 *
 * This type is used to define the shape of a product object when it is added
 * to the cart. Each product in the cart has the following properties:
 *
 * @interface CartProductType
 * @property {string} id - The unique identifier for the product. This is typically a string representation of a MongoDB ObjectId or another unique ID.
 * @property {string} image - The URL or path to the product's image. This can be used to display the product image in the cart.
 * @property {string} name - The name of the product. This is used to identify the product and display its name in the cart.
 * @property {Object} category - An object representing the category to which the product belongs category {name: string; slug:string}.
 * @property {string} category.name - The name of the category. This helps to group and categorize products.
 * @property {string} category.slug - A URL-friendly version of the category name, often used for routing or linking purposes.
 * @property {number} price - The price of the product. This represents the cost of the product and is used for calculating the total cost in the cart.
 */
export interface CartProductType {
    id: string;
    thumbnail: string;
    name: string;
    category: { name: string; slug: string };
    quantity: number;
    price: number;
    currency: string;
}

/**
 * cart table row type
 *
 */

export type CartTableRowType = { row: Row<CartProductType> };
