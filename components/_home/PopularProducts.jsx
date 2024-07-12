import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ProductCard from '@/components/_card/ProductCard';
import HomeTitle from '@/components/HomeTitle/HomeTitle';
import ForAnimate from '../Client/ForAnimate/ForAnimate';

export default async function PopularProducts() {
    const popularProductsArr = await getProducts('popular-product');

    return (
        <section className="container mx-auto mb-10">
            <ForAnimate tagName="div" animateClassName="animate-fade-left">
                <HomeTitle>
                    <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
                </HomeTitle>
            </ForAnimate>
            <div className="mx-auto my-8 flex justify-center gap-3  items-center w-fit flex-wrap ">
                {popularProductsArr?.map((product) => (
                    <ProductCard key={product?.id} productDetails={product} />
                ))}
            </div>
        </section>
    );
}
