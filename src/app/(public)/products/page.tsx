import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { getCategoryWithCount } from '@/server/category';
import { FilterSearchParamType } from '@/types/product';
import FilterSection from './_components/filter-section';
import ProductsSection from './_components/products-section';

export default async function ProductPage({
    searchParams,
}: {
    searchParams: FilterSearchParamType;
}) {
    const categoryWithCount = await getCategoryWithCount('?limit=5');

    return (
        <main className="container mx-auto">
            {/* breadcrumb Product page*/}
            <Breadcrumb>
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink href="/">Home</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Products</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>
            {/* breadcrumb Product page*/}

            <section className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-1 gap-6 pt-4 pb-16 items-start justify-center sm:mx-auto mx-2 ">
                {/* filter section */}
                <FilterSection categoryWithCount={categoryWithCount} />

                {/* product section */}
                <ProductsSection searchParams={searchParams} />
            </section>
        </main>
    );
}
