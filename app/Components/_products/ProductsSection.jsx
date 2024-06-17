import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ProductViewChange from '../Client/_products/ProductViewChange';
import ProductCard from '../ProductCard/ProductCard';

export default async function ProductsSection() {
    const allProduct = await getProducts();
    return (
        <ProductViewChange
            ListViewCard={allProduct?.map((product) => (
                <ProductCard productDetails={product} key={product.id} />
            ))}>
            {allProduct?.map((product) => (
                <ProductCard productDetails={product} key={product.id} />
            ))}
        </ProductViewChange>
    );
}
