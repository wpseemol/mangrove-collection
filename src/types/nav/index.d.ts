/**
 * Interface definition for a single menu item
 */
export interface MenuItem {
    /**
     * Unique identifier for the menu item.
     * - Type: `string | number`
     */
    id: string | number;

    /**
     * The URL or anchor link for the menu item.
     * - Type: `string`
     */
    href: string;

    /**
     * The display label text for the menu item.
     * - Type: `string`
     */
    label: string;
}
