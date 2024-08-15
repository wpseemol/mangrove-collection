import Link from 'next/link';
import { FaChevronRight, FaHouse } from 'react-icons/fa6';

type BreadcrumbProps = {
    pageName?: string;
    href?: string;
    more?: React.ReactNode | null;
};

export default function Breadcrumb({
    pageName = 'pageName',
    href = '#',
    more = null,
}: BreadcrumbProps) {
    return (
        <div className="container py-4 flex items-center gap-3">
            <Link
                href="/"
                className="text-primary text-base hover:text-primary-foreground duration-150">
                <FaHouse />
            </Link>

            <FaChevronRight className="text-sm text-gray-400" />

            <Link href={href}>
                <p className="text-primary text-base hover:text-primary-foreground font-medium duration-150">
                    {pageName}
                </p>
            </Link>
            {more && more}
        </div>
    );
}
