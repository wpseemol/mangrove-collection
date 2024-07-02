import Link from 'next/link';

export default function OffersPage() {
    return (
        <main className="py-10 text-center">
            <p>
                Now no Offer is running
                <Link
                    className="bg-primaryColor px-4 py-2 text-white border rounded-sm capitalize"
                    href="/">
                    {' '}
                    go home{' '}
                </Link>{' '}
            </p>
        </main>
    );
}
