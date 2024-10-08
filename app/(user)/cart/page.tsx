import CartEmptyComponent from './_components/cart-empty';
import CartItems from './_components/cart-items';

export default async function CartPage() {
    return (
        <main className="container mx-auto min-h-[calc(100vh-26.8rem)] flex flex-col justify-center">
            <CartEmptyComponent />
            <CartItems />
        </main>
    );
}
