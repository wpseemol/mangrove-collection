import HasShippingItem from './_components/has-shipping-items';

export default function ShippingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <HasShippingItem />
            {children}
        </>
    );
}
