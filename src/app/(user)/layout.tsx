/**
 * Meta is not need here Root Already has.
 *
 */

export default function UserLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return <>{children}</>;
}
