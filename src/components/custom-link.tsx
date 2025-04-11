'use client';

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
                        ? 'text-primary'
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