import Link from 'next/link';

export default function NotFoundPage() {
    return (
        <main className="w-full h-[calc(100vh-25rem)]">
            <div className="flex h-full items-center justify-center">
                <section>
                    <p>opps, this is Not fond page</p>

                    <h2 className="mb-5">go back to home page</h2>

                    <Link
                        href={'/'}
                        className="px-4 py-2 bg-primaryColor text-white m-5 w-fit">
                        Home
                    </Link>
                </section>
            </div>
        </main>
    );
}
