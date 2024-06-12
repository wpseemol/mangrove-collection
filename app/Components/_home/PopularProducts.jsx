import HomeTitle from '@/app/Components/HomeTitle/HomeTitle';
import ProductCard from '@/app/Components/ProductCard/ProductCard';

export default function PopularProducts() {
    return (
        <section className="container mx-auto mb-10">
            <HomeTitle>
                <samp className="uppercase">POPULAR PRODUCTS🔥</samp>
            </HomeTitle>
            <div className="mx-auto my-8 flex justify-center gap-3  items-center w-fit flex-wrap">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
        </section>
    );
}
