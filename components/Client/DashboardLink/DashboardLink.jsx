'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLink({ children, className, href }) {
    const pathName = usePathname();

    return (
        <Link
            className={`${
                pathName === href ? 'text-primaryColor' : ''
            } className hover:text-primaryColor duration-200`}
            href={href}>
            {children}
        </Link>
    );
}
