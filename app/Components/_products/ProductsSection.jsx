import ListViewCard from '@/app/Components/_card/ListViewCard';
import ProductCard from '@/app/Components/_card/ProductCard';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ProductViewChange from '../Client/_products/ProductViewChange';

export default async function ProductsSection({ searchParams }) {
    const { category, price, size } = searchParams;

    let categoryArray = [];
    if (category) {
        const decodedCategory = decodeURI(category);
        categoryArray = decodedCategory?.split('|');
    }

    console.log(categoryArray);

    const allProduct = await getProducts('type', categoryArray, price, size);

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
