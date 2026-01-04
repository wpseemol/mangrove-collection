import { getPurchaseProductData } from "@/lib/actions/purchase";

import CheckoutProvider from "./_components/purch-provider";

import CheckoutFormComponent from "./_components";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const purchasesProducts = await getPurchaseProductData();
    console.log(purchasesProducts);

    return (
        <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
            <section className="">
                <CheckoutProvider>
                    {purchasesProducts && (
                        <CheckoutFormComponent
                            purchasesData={JSON.stringify(purchasesProducts)}
                        />
                    )}
                </CheckoutProvider>
            </section>
        </main>
    );
}
