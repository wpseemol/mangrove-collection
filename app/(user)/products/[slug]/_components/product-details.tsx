import { ProductDetailsType } from '@/types/products';

export default function ProductDetails({
    details,
}: {
    details: ProductDetailsType;
}) {
    return (
        <div>
            <h2 className="text-4xl">product details</h2>
            <pre className="text-wrap">{JSON.stringify(details)}</pre>
        </div>
    );
}
