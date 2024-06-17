export default function ProductDetailsPage({ params: { productSlug } }) {
    return (
        <main>
            <section>
                <p>
                    single Product slug now
                    <span>{productSlug}</span>
                </p>
            </section>
        </main>
    );
}
