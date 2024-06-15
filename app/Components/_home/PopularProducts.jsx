import HomeTitle from '@/app/Components/HomeTitle/HomeTitle';
import ProductCard from '@/app/Components/ProductCard/ProductCard';
import getProducts from '@/app/bd/mongoosQuery/getProducts';

export default async function PopularProducts() {
    const popularProductsArr = await getProducts('popular-product');

    return (
        <section className="container mx-auto mb-10">
            <HomeTitle>
                <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
            </HomeTitle>
            <div className="mx-auto my-8 flex justify-center gap-3  items-center w-fit flex-wrap ">
                {popularProductsArr?.map((product) => (
                    <ProductCard key={product?.id} productDetails={product} />
                ))}
            </div>
        </section>
    );
}
