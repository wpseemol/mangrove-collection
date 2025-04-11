import CustomLink from '@/components/custom-link';

import { MenuItem } from '@/types/nav';
import Link from 'next/link';
import CategoryMenus from './category-menus';

export function NavMenu() {
    return (
        <>
            {menuArray?.map((items) => {
                return (
                    <li
                        key={items.id}
                        className={`capitalize hover:text-primary-foreground duration-200 border-b border-border md:py-3 md:border-none p-2 group/menu last:border-none dark:border-neutral-200/20 ${
                            items.id === 'category'
                                ? 'group/category relative duration-500 origin-top'
                                : ''
                        }`}>
                        {items.id === 'contact' || items.id === 'about' ? (
                            <Link
                                href={items.href}
                                className="group-hover/menu:md:pl-0 group-hover/menu:pl-2 duration-150">
                                {items.label}
                            </Link>
                        ) : (
                            <CustomLink
                                isActive={items.id !== 'category'}
                                href={items.href}
                                className="group-hover/menu:md:pl-0 group-hover/menu:pl-2 duration-150">
                                {items.label}
                            </CustomLink>
                        )}

                        {items.id === 'category' && <CategoryMenus />}
                    </li>
                );
            })}
        </>
    );
}

const menuArray: MenuItem[] = [
    { id: 'category', href: '#', label: 'Category' },
    { id: 'products', href: '/products', label: 'products' },
    { id: 'contact', href: '/#contact', label: 'contact' },
    { id: 'about', href: '/#about', label: 'about' },
];
