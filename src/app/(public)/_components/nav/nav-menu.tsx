import CustomLink from '@/components/custom-link';



import CategoryMenus from './category-menus';

import SubMenu from './sub-menu';

export function NavMenu() {
    return (
        <>
            {menuArray?.map((items) => {
                return (
                    <li
                        key={items.id}
                        className={`capitalize hover:text-primary duration-200 border-b border-border md:border-none group/menu last:border-none dark:border-neutral-200/20 relative p-2 py-3 md:p-0`}>

                        {
                            items.subMenu ?
                                (
                                    /**
                                     * f the menu item is a sub menu then show the sub menu
                                     * lse show the link
                                     */
                                    items.id === 'category' && (
                                    <SubMenu menuItme={items} SubMenuContent={<CategoryMenus />} />)
                                )

                                : (<CustomLink
                                    isActive={items.id !== 'category'}
                                    href={items.href}
                                    className="group-hover/menu:pl-2 md:py-3 p-2">
                                    {items.label}
                                </CustomLink>)

                        }






                    </li>
                );
            })}
        </>
    );
}

const menuArray: MenuItem[] = [
    { id: 'category', href: '#', label: 'Category', subMenu: true },
    { id: 'products', href: '/products', label: 'products', subMenu: false },
    { id: 'contact', href: '/#contact', label: 'contact', subMenu: false },
    { id: 'about', href: '/#about', label: 'about', subMenu: false },
];


export interface MenuItem {
    id: string;
    href: string;
    label: string;
    subMenu: boolean
}
