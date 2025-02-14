/**
 * Define the interface for each feature object
 */
export interface Feature {
    /**
     * The unique identifier for the item.
     */
    id: string;
    /**
     * jsx element for icon react icon
     */
    icon: JSX.Element;
    /**
     * `title` string
     */
    title: string;
    /**
     * `description` string about feature
     */
    description: string;
}

/**
 * `SliderContent` an item in the inventory.
 */
export interface SliderContent {
    /**
     * The unique identifier for the item.
     */
    id: string | number;

    /**
     * The URL of the item's image.
     */
    imgUrl: string;

    /**
     * The name of the item.
     */
    name: string;
}

/**
 * Interface definition for a single menu item
 */
export interface MenuItem {
    /**
     * - `id` type `string` `number`
     * Unique identifier for the menu item
     */
    id: string | number;

    /**
     * - `href` type `string`
     * The URL or anchor link for the menu item
     */
    href: string;

    /**
     * - `label` type `string`
     * The display label text for the menu item
     */
    label: string;
}
