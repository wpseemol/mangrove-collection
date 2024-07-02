import getProductDetails from '@/app/bd/mongoosQuery/getProductDetails';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import Details from '@/app/Components/_productDetails/Details';
import RelatedProduct from '@/app/Components/_productDetails/RelatedProduct';
import Breadcrumb from '@/app/Components/Breadcrumb/Breadcrumb';
import capitalizeWord from '@/utils/capitalizeWords';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';

export async function generateMetadata({ params: { productSlug } }) {
    const productDetails = await getProductDetails(productSlug);

    const productName = capitalizeWord(
        productDetails?.productName?.toLowerCase()
    );

    return {
        title: productName,
    };
}

export default async function ProductDetailsPage({ params: { productSlug } }) {
    const productDetails = await getProductDetails(productSlug);
    const categoryIds = productDetails?.category?._id?.toString();

    const relatedProducts = await getProducts(
        'related-product',
        [categoryIds],
        null,
        null,
        productDetails?.id
    );

    return (
        <main className="container mx-auto">
            {/* page Breadcrumb */}
            <Breadcrumb
                pageName="Products"
                href="/products"
                more={
                    <>
                        <FaChevronRight className="text-sm text-gray-400" />
                        <Link href="#">
                            <p className="text-primary text-base hover:text-primaryColor text-primaryColor duration-150 capitalize">
                                {capitalizeWord(
                                    productDetails?.productName?.toLowerCase()
                                )}
                            </p>
                        </Link>
                    </>
                }
            />
            <Details productDetails={productDetails} />

            {/* related Product  */}
            <RelatedProduct relatedProducts={relatedProducts} />
        </main>
    );
}
