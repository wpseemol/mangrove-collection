import Link from 'next/link';
import { FaChevronRight, FaHouse } from 'react-icons/fa6';

export default function Breadcrumb({ pageName = 'pageName' }) {
    return (
        <div className="container py-4 flex items-center gap-3">
            <Link
                href="/"
                className="text-primary text-base hover:text-primaryColor duration-150">
                <FaHouse />
            </Link>

            <FaChevronRight className="text-sm text-gray-400" />

            <p className="font-medium text-primaryColor duration-150">
                {pageName}
            </p>
        </div>
    );
}
