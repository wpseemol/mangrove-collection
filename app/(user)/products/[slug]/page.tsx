import getProductDetails from '@/db/mongoos-queries/get-product-details';

interface PramsType {
    params?: { slug: string };
}

export default async function ProductDetailPage({ params }: PramsType) {
    let productDetail = null;

    if (params?.slug) {
        productDetail = await getProductDetails(params.slug);
    }

    return <div>{JSON.stringify(productDetail)}</div>;
}
