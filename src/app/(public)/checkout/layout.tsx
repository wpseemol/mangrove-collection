import CheckPurchase from './_components/check-purchase';

export default function CheckoutLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <CheckPurchase>{children}</CheckPurchase>
        </>
    );
}
