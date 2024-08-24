// Defines the types used for custom links and menu items.

// `CustomLinkType` represents the properties for a custom link component.
interface CustomLinkType {
    /**
     * Optional CSS class name to apply custom styles to the link.
     */
    className?: string; // Optional class name for custom styling.

    /**
     * The URL the link points to.
     */
    href: string; // The URL to navigate to when the link is clicked.

    /**
     * The content to be displayed inside the link. Typically this will be text or other React components.
     */
    children: React.ReactNode; // React nodes (e.g., text, elements) to render inside the link.

    /**
     * Optional flag to indicate if the link is currently active (e.g., the current page).
     */
    isActive?: boolean; // Optional flag to indicate if the link is active.
}

// `MenuType` represents the properties for a menu item.
interface MenuType {
    /**
     * Unique identifier for the menu item.
     */
    id: string; // Unique identifier for the menu item.

    /**
     * The URL the menu item points to.
     */
    href: string; // The URL to navigate to when the menu item is clicked.

    /**
     * Label text displayed for the menu item.
     */
    label: string; // Text label of the menu item.
}

export type { CustomLinkType, MenuType };
