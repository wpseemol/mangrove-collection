import { getProductDetails } from '@/server/products';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';

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

    return <main>{JSON.stringify(productDetails.thumbnail)}</main>;
}
