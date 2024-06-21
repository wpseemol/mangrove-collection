import Breadcrumb from '@/app/Components/Breadcrumb/Breadcrumb';
import getCategory from '@/app/bd/mongoosQuery/getCategory';
import FilterSection from '../Client/_products/FilterSection';
import ProductsSection from './ProductsSection';

export default async function ProductsComponents() {
    const allCategory = await getCategory();

    return (
        <>
            <Breadcrumb pageName="Products" />
            <section className="grid md:grid-cols-5 grid-cols-1 gap-6 pt-4 pb-16 items-start justify-center sm:mx-auto mx-2">
                <FilterSection allCategory={allCategory} />
                <div className="  md:col-span-3 col-span-1 ">
                    <ProductsSection />
                </div>
            </section>
        </>
    );
}
