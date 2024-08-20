import Breadcrumb from '@/components/bread-crumb';
import { ProductDetailsType } from '@/types/products';
import wordEllipsis from '@/utils/word-ellipsis';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';

export default function ProductDetails({
    details,
}: {
    details: ProductDetailsType;
}) {
    return (
        <>
            <Breadcrumb
                pageName="Products"
                href="/products"
                more={
                    <>
                        <FaChevronRight className="text-sm text-gray-400" />
                        <Link href="#">
                            <p className="text-primary text-base hover:text-primary-foreground duration-150 capitalize">
                                {wordEllipsis(details.name.toLowerCase())}
                            </p>
                        </Link>
                    </>
                }
            />
            <h2 className="text-4xl">{details.name}</h2>
            <pre className="text-wrap">{JSON.stringify(details)}</pre>
        </>
    );
}
