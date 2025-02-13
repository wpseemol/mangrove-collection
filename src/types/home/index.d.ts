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
