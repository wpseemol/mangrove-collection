import { Toaster } from '@/components/ui/toaster';
import getProductDetails from '@/db/mongoos-queries/get-product-details';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProductDetails from './_components/product-details';

interface PramsType {
    params?: { slug: string };
}

export async function generateMetadata({
    params,
}: PramsType): Promise<Metadata> {
    let productDetail = null;

    if (params?.slug) {
        productDetail = await getProductDetails(params.slug);
    }

    if (productDetail) {
        const previousImages = productDetail?.images || [
            { imgUrl: productDetail.thumbnail || '' },
        ];

        return {
            title: productDetail.name,
            description: productDetail.description,
            openGraph: {
                title: productDetail.name,
                description: productDetail?.description,
                images: previousImages.map((img) => ({
                    url: img.imgUrl,
                    width: 300,
                    height: 300,
                    alt: productDetail.name,
                })),

                url: `${process.env.SITE_BASE_URL!}/products/${params?.slug}`,
            },
        };
    } else {
        return { title: 'Mangrove Collection | Details Page' };
    }
}

export default async function ProductDetailPage({ params }: PramsType) {
    let productDetail = null;

    if (params?.slug) {
        productDetail = await getProductDetails(params.slug);
    }

    if (!productDetail) {
        notFound();
    }

    return (
        <>
            <main className="container mx-auto min-h-[calc(100vh-25rem)]">
                {productDetail && <ProductDetails details={productDetail} />}
            </main>
            <Toaster />
        </>
    );
}
