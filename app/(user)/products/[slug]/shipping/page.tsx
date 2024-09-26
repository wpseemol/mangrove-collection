import ShippingBilling from './_components/shipping-billing';
import ShippingContents from './_components/shipping-contents';
import ShippingOrderSummary from './_components/shipping-order-summary';

export default function ShippingPage() {
    return (
        <main className="container mx-auto my-5 flex gap-5">
            <section className="w-[70%]">
                <ShippingBilling />
                <ShippingContents />
            </section>
            <section className="w-[30%]">
                <ShippingOrderSummary />
            </section>
        </main>
    );
}
