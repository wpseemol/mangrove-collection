import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";
import MyOrderPageContent from "./_components/my-order-page-content";
import MyOrderPageMenu from "./_components/my-order-page-menu";

export const dynamic = "force-dynamic";

export default async function MyOrderPage({
     searchParams,
}: {
     searchParams: Promise<SearchParams>;
}) {
     const paramsSearch = await searchParams;

     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
               <section className="flex md:flex-row flex-col">
                    <section className="md:w-[25%] w-full min-h-[calc(100vh-25.45rem)] bg-green-950/10 py-4 pt-0 px-2 md:rounded-l-lg shadow-xl md:border-r border-green-800/80 relative">
                         <DynamicBreadcrumb />

                         {/* order menu */}
                         <MyOrderPageMenu />
                    </section>
                    <section className="md:w-[75%] w-full py-3 px-2">
                         <MyOrderPageContent searchParams={paramsSearch} />
                    </section>
               </section>
          </main>
     );
}

export interface SearchParams {
     section?: string;
}
