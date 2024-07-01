import ProductCard from '../_card/ProductCard';

export default function RelatedProduct({ relatedProducts }) {
    return (
        <div className="container pb-16">
            <h2 className="text-2xl font-medium text-gray-800 uppercase mb-6">
                Related products
            </h2>
            <div className="flex items-center flex-wrap gap-6">
                {relatedProducts?.map((product) => (
                    <ProductCard key={product?.id} productDetails={product} />
                ))}
            </div>
        </div>
    );
}
