import Breadcrumb from '@/components/bread-crumb';

export const metadata = {
    title: 'Mangrove Collection | Products',
};

export default function ProductPage({ searchParams }) {
    return (
        <main className="container mx-auto">
            <Breadcrumb pageName="Products" />
            <p>product page</p>
        </main>
    );
}
