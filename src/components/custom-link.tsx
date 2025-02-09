'use client';
import { CustomLinkType } from '@/types/nav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function CustomLink({
    className,
    href,
    children,
    isActive = true,
}: CustomLinkType) {
    // const router: AppRouterInstance = useRouter();
    const pathName: string = usePathname();

    // async function handelClick(event: MouseEvent<HTMLAnchorElement>) {
    //     event.preventDefault();
    //     if (pathName !== href) {
    //         if (href.includes('#')) {
    //             router.push(href);
    //         } else {
    //             animatePageOut(href, router);
    //         }
    //     }
    // }

    return (
        <Link
            scroll={false}
            className={`${
                isActive
                    ? pathName === href
                        ? 'text-primary-foreground'
                        : ''
                    : ''
            } ${className}`}
            href={href}
            // onClick={handelClick}
        >
            {children}
        </Link>
    );
}
