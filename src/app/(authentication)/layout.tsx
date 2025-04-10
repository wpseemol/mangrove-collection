export default function AuthencationLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <p>this is Authencation layout</p>
            {children}
        </>
    );
}