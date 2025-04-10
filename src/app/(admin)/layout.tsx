export default function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
        <p>this is admin layout</p>
            {children}
        </>
    );
}