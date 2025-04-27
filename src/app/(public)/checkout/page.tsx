import { getPurchaseProductData } from "@/lib/server/purchase";
import { CheckoutForm } from "./_components/checkout-form";
import PurchProvider from "./_components/purch-provider";
import YourOrderSection from "./_components/your-order-section";

export default async function CheckoutPage() {
     const purchasesProducts = await getPurchaseProductData();

     return (
          <main className="container mx-auto min-h-[calc(100vh-25.45rem)]">
               <section className="grid md:grid-cols-2 grid-cols-1">
                    <PurchProvider>
                         <CheckoutForm />
                         <YourOrderSection data={purchasesProducts} />
                    </PurchProvider>
               </section>
          </main>
     );
}
