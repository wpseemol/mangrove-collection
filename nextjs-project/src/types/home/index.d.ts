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
     * Product url
     * - type: string
     */
    url: string;

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



/**
 * Represents the details of a home page, including its ID, title, description, sliders, and banners.
 *
 * @interface HomePageDetails
 * @property {string} pageId - The unique identifier for the home page.
 * @property {string} pageTitle - The title of the home page.
 * @property {string} pageDescription - A brief description of the home page.
 * @property {BannerSliderType[]} sliders - An array of slider objects associated with the home page.
 * @property {BannerSliderType[]} banners - An array of banner objects associated with the home page.
 * 
 */

export interface HomePageDetailsType {
    pageId: string;
    pageTitle: string;
    pageDescription: string;
    sliders: BannerSliderType[];
    banners: BannerSliderType[];
}


      
/**
 * Represents a banner item with its properties.
 *
 * @interface BannerSliderType
 * @property {string} id - The unique identifier for the banner.
 * @property {("right-top" | "right-bottom" | "slides")} type - The type of the banner, either "right-top", "right-bottom", or "slides".
 * @property {string} title - The title of the banner.
 * @property {string} imageUrl - The URL of the banner's image.
 * @property {string} linkTarget - The target URL for the banner link.
 * @property {boolean} linkStatus - The status of the banner link (active/inactive).
 */
export interface BannerSliderType {
    id: string;
    type: "right-top" | "right-bottom" | "slides";
    title: string;
    imageUrl: string;
    linkTarget: string;
    linkStatus: boolean;
}