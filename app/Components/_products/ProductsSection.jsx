import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ProductCard from '../ProductCard/ProductCard';

export default async function ProductsSection() {
    const allProduct = await getProducts();
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {allProduct?.map((product) => (
                <ProductCard productDetails={product} key={product.id} />
            ))}
        </div>
    );
}
