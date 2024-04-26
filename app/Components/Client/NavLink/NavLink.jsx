'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function NavLink({ children, href }) {
    const pathName = usePathname();

    return (
        <Link
            href={href}
            className={`${
                pathName === href ? 'text-primaryColor' : ''
            } hover:text-primaryColor duration-300`}>
            {children}
        </Link>
    );
}
