import GetCartData from './_components/get-cart-data';

export default function CartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <GetCartData />
            {children}
        </>
    );
}
