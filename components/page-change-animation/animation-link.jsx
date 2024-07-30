'use client';
import { animatePageOut } from '@/utils/animation';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export default function AnimationLink({
    className,
    href,
    children,
    isActive = true,
}) {
    const router = useRouter();
    const pathName = usePathname();

    const handelClick = async (e) => {
        e.preventDefault();
        if (pathName !== href) {
            if (href.includes('#')) {
                router.push(href);
            } else {
                animatePageOut(href, router);
            }
        }
    };

    return (
        <Link
            className={`${
                isActive ? (pathName === href ? 'text-primaryColor' : '') : ''
            } ${className}`}
            href={href}
            onClick={handelClick}>
            {children}
        </Link>
    );
}
