import Breadcrumb from '@/app/Components/Breadcrumb/Breadcrumb';
import FilterComponents from './FilterComponents';
import ProductsSection from './ProductsSection';

export default function ProductsComponents() {
    return (
        <>
            <Breadcrumb pageName="Products" />
            <section className="grid md:grid-cols-5 grid-cols-2 gap-6 pt-4 pb-16 items-start">
                <FilterComponents />
                <div className="col-span-3">
                    <ProductsSection />
                </div>
            </section>
        </>
    );
}
