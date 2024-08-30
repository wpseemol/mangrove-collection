import Breadcrumb from '@/components/bread-crumb';
import VariantContentUpdateProvider from '@/components/providers/varient-update-provider';
import { CategoryWithMongo_Id } from '@/types/mongoose-models';
import { ProductDetailsType } from '@/types/products';
import wordEllipsis from '@/utils/word-ellipsis';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';
import Details from './details-section';
import RelatedProduct from './related-product';

export default function ProductDetails({
    details,
}: {
    details: ProductDetailsType;
}) {
    const category = details.category as CategoryWithMongo_Id;

    return (
        <>
            {/* Breadcrumb */}
            <Breadcrumb
                pageName="Products"
                href="/products"
                more={
                    <>
                        <FaChevronRight className="text-sm text-gray-400" />
                        <Link href="#">
                            <p className="text-primary text-base hover:text-primary-foreground duration-150 capitalize">
                                {wordEllipsis(details.name.toLowerCase(), 10)}
                            </p>
                        </Link>
                    </>
                }
            />
            {/* Breadcrumb */}
            <VariantContentUpdateProvider>
                <Details details={details} />
            </VariantContentUpdateProvider>
            {/* related product */}
            <RelatedProduct
                excludeProductId={details.id}
                categoryId={category._id.toString()}
            />
            {/* related product */}
        </>
    );
}
