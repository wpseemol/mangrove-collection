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
