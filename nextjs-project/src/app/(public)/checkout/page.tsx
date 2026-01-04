import { getPurchaseProductData } from "@/lib/actions/purchase";

import CheckoutProvider from "./_components/purch-provider";

import CheckoutFormComponent from "./_components";
import EmptyCheckout from "./_components/checkout-empty";
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const purchasesProducts = await getPurchaseProductData();
    if (!purchasesProducts) {
        return <EmptyCheckout />;
    }

    return (
        <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
            <section className="px-6 mt-4">
                <DynamicBreadcrumb />
            </section>
            {/* breadcrumb Product page*/}

            <CheckoutProvider>
                {purchasesProducts && (
                    <CheckoutFormComponent
                        purchasesData={JSON.stringify(purchasesProducts)}
                    />
                )}
            </CheckoutProvider>
        </main>
    );
}
