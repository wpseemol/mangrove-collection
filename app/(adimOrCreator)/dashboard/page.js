import { auth } from '@/auth/auth';
import { ADMIN, CREATOR } from '@/constant-value';
import { redirect } from 'next/navigation';
import { SaleChart } from './_components/total-sale-chart';

export default async function DashboardPage() {
    const section = await auth();

    let userTypeCake;

    switch (section?.user?.role) {
        case ADMIN:
            userTypeCake = 'Admin';
            break;
        case CREATOR:
            userTypeCake = 'Content Creator';
            break;

        default:
            redirect('/account');
            return;
    }

    return (
        <main>
            <SaleChart />
        </main>
    );
}
