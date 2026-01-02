import { getPurchaseProductData } from "@/lib/actions/purchase";

import CheckoutProvider from "./_components/purch-provider";

import TestCheckout from "./_components";
import OrderSummary from "./_components/order-summary";

export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
    const purchasesProducts = await getPurchaseProductData();
    //     console.log(purchasesProducts);

    return (
        <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
            <section className="">
                <CheckoutProvider>
                    <TestCheckout />
                    {/* <CheckoutForm /> */}
                    {/* <YourOrderSection data={purchasesProducts} /> */}
                </CheckoutProvider>
            </section>
        </main>
    );
}
