import CartItems from './_components/cart-items';
import CartProductsProvider from './_components/cart-products-provider';

export default function CardPage() {
    return (
        <main className="container mx-auto min-h-[calc(100vh-26.8rem)] flex flex-col justify-center">
            <CartProductsProvider>
                <CartItems />
            </CartProductsProvider>
        </main>
    );
}
