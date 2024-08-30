import Breadcrumb from '@/components/bread-crumb';
import { getCategory } from '@/db/mongoos-queries/get-category';

import { CategoryType } from '@/types/mongoose-models';
import { FilterSearchParamType } from '@/types/products';
import FilterSection from './_components/filter-section';
import ProductSection from './_components/product-section';

export const metadata = {
    title: 'Mangrove Collection | Products',
};

export default async function ProductPage({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    const allCategory: CategoryType = await getCategory('withCountProduct');
    return (
        <main className="container mx-auto">
            <Breadcrumb pageName="Products" />

            <section className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-1 gap-6 pt-4 pb-16 items-start justify-center sm:mx-auto mx-2 ">
                <FilterSection allCategory={allCategory} />
                <div className="lg:col-span-4 md:col-span-3 col-span-1">
                    <ProductSection searchParams={searchParams} />
                </div>
            </section>
        </main>
    );
}
