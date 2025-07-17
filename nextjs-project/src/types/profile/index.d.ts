/**
 * Represents a menu item in the profile menu.
 *
 * @property {number} id - Unique identifier for the menu item.
 * @property {string} title - Display title of the menu item.
 * @property {JSX.Element} icon - Icon component to be rendered for the menu item.
 * @property {string} href - URL or route the menu item links to.
 */
export interface ProfileMenuList {
     id: number;
     title: string;
     icon: JSX.Element;
     href: string;
}

// ProfileMenuItem is an interface representing a single item in the profile menu
export interface ProfileMenuItem {
     id: number;
     title: string;
     icon: JSX.Element;
     href: string;
}
