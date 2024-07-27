import getProductDetails from '@/app/bd/mongoosQuery/getProductDetails';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import Details from '@/components/_productDetails/Details';
import RelatedProduct from '@/components/_productDetails/RelatedProduct';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import VariantContentUpdateProvider from '@/components/Client/Providers/variant-content-update/variant-content-update';
import capitalizeWord from '@/utils/capitalizeWords';
import titleWordClops from '@/utils/titleWordClops';
import Link from 'next/link';
import { FaChevronRight } from 'react-icons/fa6';

export async function generateMetadata({ params: { productSlug } }) {
    const productDetails = await getProductDetails(productSlug);

    const productName = capitalizeWord(productDetails?.name?.toLowerCase());

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
        <main className=" sm:container w-screen mx-auto md:px-0 px-2 ">
            {/* page Breadcrumb */}
            <Breadcrumb
                pageName="Products"
                href="/products"
                more={
                    <>
                        <FaChevronRight className="text-sm text-gray-400" />
                        <Link href="#">
                            <p className="text-primary text-base hover:text-primaryColor text-primaryColor duration-150 capitalize">
                                {titleWordClops(
                                    capitalizeWord(
                                        productDetails?.productName?.toLowerCase()
                                    ),
                                    5
                                )}
                            </p>
                        </Link>
                    </>
                }
            />
            <VariantContentUpdateProvider>
                <Details productDetails={productDetails} />
            </VariantContentUpdateProvider>
            {/* related Product  */}
            <RelatedProduct relatedProducts={relatedProducts} />
        </main>
    );
}
