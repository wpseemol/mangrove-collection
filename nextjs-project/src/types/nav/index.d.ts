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

/**
 *
 * `CustomLinkType` represents the properties for a custom link component.
 */
interface CustomLinkType {
    /**
     * Optional CSS class name to apply custom styles to the link.
     * - type: string
     */
    className?: string; // Optional class name for custom styling.

    /**
     * The URL the link points to.
     * - type: string
     */
    href: string; // The URL to navigate to when the link is clicked.

    /**
     * The content to be displayed inside the link. Typically this will be text or other React components.
     * -type: React.ReactNode
     */
    children: React.ReactNode; // React nodes (e.g., text, elements) to render inside the link.

    /**
     * Optional flag to indicate if the link is currently active (e.g., the current page).
     * - type: boolean
     */
    isActive?: boolean; // Optional flag to indicate if the link is active.
}
