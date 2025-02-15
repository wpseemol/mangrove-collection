/**
 * Define the interface for each feature object
 */
export interface Feature {
    /**
     * The unique identifier for the item.
     * - type: string | number
     */
    id: string | number;
    /**
     * jsx element for icon react icon
     * - type: jsx.element
     */
    icon: JSX.Element;
    /**
     * `title` string
     *  - type: string
     */
    title: string;
    /**
     * `description` string about feature
     * - type: string
     */
    description: string;
}

/**
 * `SliderContent` an item in the inventory.
 */
export interface SliderContent {
    /**
     * The unique identifier for the item.
     * - type: string | number
     */
    id: string | number;

    /**
     * The URL of the item's image.
     * - type: string
     */
    imgUrl: string;

    /**
     * The name of the item.
     * - type: string
     */
    name: string;
}

/**
 * Represents a product category with an ID, name, slug, and an image URL.
 *
 * @interface Category
 * @property {string | number} id - The unique identifier for the category. It can be either a string or a number.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL to the image associated with the category.
 */
export interface Category {
    id: string | number;
    name: string;
    slug: string;
    imgUrl: string;
}
