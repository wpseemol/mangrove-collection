'use client';
export default function SelectedVariant({ type, variants }) {
    const typeVariants = variants?.filter((variant) => variant?.type === type);

    return (
        <>
            {typeVariants?.map((variant) => (
                <span
                    key={variant?.id}
                    className="bg-primaryColor/60 py-1 px-2 rounded text-neutral-600 capitalize">
                    {variant?.title}
                </span>
            ))}
        </>
    );
}
