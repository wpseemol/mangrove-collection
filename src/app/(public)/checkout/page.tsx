import { CheckoutForm } from './_components/checkout-form';
import YourOrderSection from './_components/your-order-section';

export default function CheckoutPage() {
    return (
        <main className="container mx-auto">
            <section className="grid md:grid-cols-2 grid-cols-1">
                <CheckoutForm />
                <YourOrderSection />
            </section>
        </main>
    );
}
