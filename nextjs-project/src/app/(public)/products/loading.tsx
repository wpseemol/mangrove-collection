import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import { getCategoryWithCount } from "@/lib/actions/category";
import FilterSection from "./_components/filter-section";

export default async function ProductLoading() {
     const categoryWithCount = await getCategoryWithCount();
     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
               {/* breadcrumb Product page*/}
               <DynamicBreadcrumb />

               <FilterSection categoryWithCount={categoryWithCount} />
               <section>
                    <div className="flex items-center justify-center h-96">
                         <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-gray-900"></div>
                    </div>
               </section>
          </main>
     );
}
