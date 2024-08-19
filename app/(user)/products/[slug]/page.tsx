import getProductDetails from '@/db/mongoos-queries/get-product-details';
import { Metadata } from 'next';
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

    const previousImages = productDetail?.images || [
        { imgUrl: productDetail?.thumbnail || '' },
    ];

    return {
        title: productDetail?.name || 'Details Page',
        description: productDetail?.description,
        openGraph: {
            title: productDetail?.name || 'Details Page',
            description: productDetail?.description,
            images: previousImages.map((img) => ({
                url: img.imgUrl,
                width: 300,
                height: 300,
                alt: productDetail?.name || 'Product Image',
            })),

            url: `${process.env.VERCEL_URL}/products/${params?.slug}`,
        },
    };
}

export default async function ProductDetailPage({ params }: PramsType) {
    let productDetail = null;

    if (params?.slug) {
        productDetail = await getProductDetails(params.slug);
    }

    return (
        <main className="container mx-auto">
            {productDetail && <ProductDetails details={productDetail} />}
        </main>
    );
}
