export default function SingleProductPage({
    params,
}: {
    params: Promise<{ slug: string }>;
}) {
    return <div>{params.slug}</div>;
}
