import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { getCategoryWithCount } from "@/lib/actions/category";
import { Metadata } from "next";
import FilterSection from "./_components/filter-section";
import ProductSection from "./_components/products-section";

export const metadata: Metadata = {
     title: "Products | Mangrove Collection",
};

export default async function ProductsPage({
     searchParams,
}: {
     searchParams: Promise<SearchParamsType>;
}) {
     const categoryWithCount = await getCategoryWithCount();

     const searchParamsData = await searchParams;

     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
               {/* breadcrumb Product page*/}
               <DynamicBreadcrumb />

               <section className="grid lg:grid-cols-5 md:grid-cols-4 grid-cols-1 gap-6 pt-4 pb-16 items-start justify-center sm:mx-auto mx-2 ">
                    <FilterSection categoryWithCount={categoryWithCount} />
                    <ProductSection searchParamsData={searchParamsData} />
               </section>
          </main>
     );
}

export interface SearchParamsType {
     category: string;
     price: string;
     size: string;
}
