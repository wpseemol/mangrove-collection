import ProductsComponents from '@/app/Components/_products/ProductsComponents';

export default function ProductsPage({ searchParams }) {
    return (
        <main className="container mx-auto">
            <ProductsComponents searchParams={searchParams} />
        </main>
    );
}
