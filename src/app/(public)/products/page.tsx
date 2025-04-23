import {
     Breadcrumb,
     BreadcrumbItem,
     BreadcrumbLink,
     BreadcrumbList,
     BreadcrumbPage,
     BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { getCategoryWithCount } from "@/lib/server/category";
import FilterSection from "./_components/filter-section";
import ProductSection from "./_components/products-section";

export default async function ProductsPage({
     searchParams,
}: {
     searchParams: Promise<SearchParamsType>;
}) {
     const categoryWithCount = await getCategoryWithCount();

     const searchParamsData = await searchParams;

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
