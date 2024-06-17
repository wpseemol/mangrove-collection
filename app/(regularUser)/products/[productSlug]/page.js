export default function ProductDetailsPage({ params: { productSlug } }) {
    return (
        <div>
            <p>
                single Product slug now
                <span>{productSlug}</span>
            </p>
        </div>
    );
}
