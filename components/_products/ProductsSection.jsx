import { getCategoryMongoId } from '@/app/bd/mongoosQuery/getCategory';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ListViewCard from '@/components/_card/ListViewCard';
import ProductCard from '@/components/_card/ProductCard';
import ProductViewChange from '../Client/_products/ProductViewChange';

export default async function ProductsSection({ searchParams }) {
    const { category, price, size } = searchParams;

    let categoryArray = [];
    let priceObj = {
        minPrice: null,
        maxPrice: null,
    };
    if (category) {
        const decodedCategory = decodeURI(category);
        categoryArray = decodedCategory?.split('|');
    }
    if (price) {
        const priceArr = price?.split('-');
        priceObj.minPrice = priceArr[0] ? priceArr[0] : null;
        priceObj.maxPrice = priceArr[1] ? priceArr[1] : null;
    }

    const categoryIds = await getCategoryMongoId(categoryArray);

    const allProduct = await getProducts('filter', categoryIds, priceObj, size);

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
