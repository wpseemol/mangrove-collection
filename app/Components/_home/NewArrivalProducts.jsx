import HomeTitle from '@/app/Components/HomeTitle/HomeTitle';
import ProductCard from '@/app/Components/ProductCard/ProductCard';
import getProducts from '@/app/bd/mongoosQuery/getProducts';

export default async function NewArrivalProducts() {
    const newArrivalProductsArr = await getProducts('new-arrival');

    return (
        <section className="container mx-auto mb-10">
            <HomeTitle>
                <samp className="uppercase">TOP NEW ARRIVAL</samp>
            </HomeTitle>
            <div className="mx-auto my-8 flex justify-center gap-3  items-center w-fit flex-wrap">
                {newArrivalProductsArr?.map((product) => (
                    <ProductCard key={product?.id} productDetails={product} />
                ))}
            </div>
        </section>
    );
}
