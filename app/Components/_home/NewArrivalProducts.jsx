import HomeTitle from '@/app/Components/HomeTitle/HomeTitle';
import ProductCard from '@/app/Components/_card/ProductCard';
import getProducts from '@/app/bd/mongoosQuery/getProducts';
import ForAnimate from '../Client/ForAnimate/ForAnimate';

export default async function NewArrivalProducts() {
    const newArrivalProductsArr = await getProducts('new-arrival');

    return (
        <section className="container mx-auto mb-10">
            <ForAnimate tagName="div" animateClassName="animate-fade-right">
                <HomeTitle>
                    <samp className="uppercase">TOP NEW ARRIVAL</samp>
                </HomeTitle>
            </ForAnimate>
            <div className="mx-auto my-8 flex justify-center gap-3  items-center sm:w-fit flex-wrap ">
                {newArrivalProductsArr?.map((product) => (
                    <ProductCard key={product?.id} productDetails={product} />
                ))}
            </div>
        </section>
    );
}
