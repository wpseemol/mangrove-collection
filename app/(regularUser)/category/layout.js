import { redirect } from 'next/navigation';

export default function CategoryLayout({ children }) {
    redirect('/products');
    return <>{children}</>;
}
