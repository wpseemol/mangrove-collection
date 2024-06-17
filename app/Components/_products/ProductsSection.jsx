import ListViewCard from '@/app/Components/_card/ListViewCard';
import ProductCard from '@/app/Components/_card/ProductCard';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ProductViewChange from '../Client/_products/ProductViewChange';

export default async function ProductsSection() {
    const allProduct = await getProducts();
    return (
        <ProductViewChange
            ListViewCard={allProduct?.map((product) => (
                <ListViewCard productDetails={product} key={product.id} />
            ))}>
            {allProduct?.map((product) => (
                <ProductCard productDetails={product} key={product.id} />
            ))}
        </ProductViewChange>
    );
}
