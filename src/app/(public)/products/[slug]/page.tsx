import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import VariantContentUpdateProvider from '@/components/varient-update-provider';
import { getProductDetails } from '@/server/products';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetails from './_components/product-details';
import RelatedProduct from './_components/related-product';

export async function generateMetadata({
    params,
}: {
    params: Promise<{ slug: string }>;
}): Promise<Metadata> {
    const slug = (await params).slug;

    const productDetails = await getProductDetails(slug);

    if (!productDetails)
        return {
            title: 'Product details page.',
            description: 'You are trying wrong product slug.',
        };

    return {
        title: productDetails.name,
        description: productDetails.description,
        openGraph: {
            title: productDetails.name,
            description: productDetails?.description,
            images: {
                url: productDetails.thumbnail,
                width: 300,
                height: 300,
                alt: productDetails.name,
            },

            url: `${process.env.NEXT_PUBLIC_API_URL!}/products/${slug}`,
        },
    };
}

export default async function SingleProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    const slug = (await params).slug;

    const productDetails = await getProductDetails(slug);

    if (!productDetails) {
        notFound();
    }

    return (
        <main className="container mx-auto min-h-[calc(100vh-25rem)]">
            {/* breadcrumb Product page*/}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/products">
                            Products
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>{productDetails.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* breadcrumb Product page*/}

            {/* product details */}
            <VariantContentUpdateProvider>
                <ProductDetails details={productDetails} />
            </VariantContentUpdateProvider>
            {/* product details */}

            {/* related products  */}
            <RelatedProduct
                skipId={productDetails.id}
                categoryId={productDetails.category._id}
            />
            {/* related products  */}
        </main>
    );
}
