import { auth } from '@/auth/auth';
import { ADMIN, CREATOR } from '@/constant-value';

export default async function DashboardPage() {
    const section = await auth();

    let userTypeCake;
    if (section?.user?.role === ADMIN) {
        userTypeCake = 'Admin';
    } else if (section?.user?.role === CREATOR) {
        userTypeCake = 'Content Creator';
    }
    return (
        <main>
            <div>
                <p className="text-center">login user type {userTypeCake} </p>
            </div>
        </main>
    );
}
