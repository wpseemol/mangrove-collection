export default function RootLoading() {
    return (
        <section className="w-full h-[calc(100vh-22rem)]">
            <div className="h-full flex items-center justify-center text-4xl font-bold">
                loading <span className="animate-bounce">...</span>{' '}
            </div>
        </section>
    );
}
