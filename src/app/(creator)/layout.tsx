export default function CreatorLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <p>creator layout</p>
            {children}
        </>
    );
}