import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import MyOrderPageContent from './_components/my-order-page-content';
import MyOrderPageMenu from './_components/my-order-page-menu';

export default async function MyOrderPage(
    params: Promise<{ searchParams: SearchParams }>
) {
    const searchParams = await (await params).searchParams;

    return (
        <main className="container mx-auto">
            <section className="flex md:flex-row flex-col">
                <section className="md:w-[25%] w-full bg-green-950/10 py-4 pt-0 px-2 md:rounded-l-lg shadow-xl md:border-r border-green-800/80">
                    <Breadcrumb className="pb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Home</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />

                            <BreadcrumbItem>
                                <BreadcrumbPage>My Order</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <MyOrderPageMenu />
                </section>
                <section className="md:w-[75%] w-full py-3 px-2">
                    <MyOrderPageContent searchParams={searchParams} />
                </section>
            </section>
        </main>
    );
}

interface SearchParams {
    section: string;
}
