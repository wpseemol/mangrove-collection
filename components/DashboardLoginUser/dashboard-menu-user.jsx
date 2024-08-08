import { ADMIN, CREATOR } from '@/constant-value';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardMenuUser({ user }) {
    let userTypeCake;
    if (user === ADMIN) {
        userTypeCake = 'Admin';
    } else if (user === CREATOR) {
        userTypeCake = 'Content Creator';
    } else {
        redirect('/account');
    }

    return (
        <section>
            <div className="flex items-center gap-2">
                <div
                    className="w-8 h-8 border bg-primaryColor/30
                 rounded-full flex items-center justify-center">
                    <Link href="/dashboard">
                        <span className="text-xl">
                            {loginUser?.fullName[0]}
                        </span>
                    </Link>
                </div>
                <div>
                    <h2 className="text-sm">{loginUser?.fullName}</h2>
                    <p className="text-xs">{userTypeCake}</p>
                </div>
            </div>
        </section>
    );
}
