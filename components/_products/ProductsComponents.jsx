import getCategory from '@/app/bd/mongoosQuery/getCategory';
import Breadcrumb from '@/components/Breadcrumb/Breadcrumb';
import FilterSection from '../Client/_products/FilterSection';
import ProductsSection from './ProductsSection';

export default async function ProductsComponents({ searchParams }) {
    const allCategory = await getCategory();

    return (
        <>
            <Breadcrumb pageName="Products" />
            <section className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-1 gap-6 pt-4 pb-16 items-start justify-center sm:mx-auto mx-2 ">
                <FilterSection allCategory={allCategory} />
                <div className=" lg:col-span-4 md:col-span-3 col-span-1 ">
                    <ProductsSection searchParams={searchParams} />
                </div>
            </section>
        </>
    );
}
