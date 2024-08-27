import { auth } from '@/auth/auth';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import Link from 'next/link';

export default async function DashboardLoginUser() {
    const session = await auth();

    let userTypeCake;
    if (session?.user.role === ADMIN) {
        userTypeCake = 'Admin';
    } else if (session?.user.role === CREATOR) {
        userTypeCake = 'Content Creator';
    }

    return (
        <section className="mr-5">
            <div className="flex items-center gap-2 group">
                <div className="w-9 h-9 border rounded-full flex items-center justify-center overflow-hidden">
                    <Link href="/dashboard/profile">
                        <span className="text-xl group-hover:text-2xl duration-100">
                            {session?.user.name[0]}
                        </span>
                    </Link>
                </div>
                <div>
                    <Link href="/dashboard/profile">
                        <h2 className="text-sm group-hover:underline group-hover:underline-offset-2 group-hover:underline-primary duration-100 ">
                            {session?.user.name}
                        </h2>
                        <p className="text-xs">{userTypeCake}</p>
                    </Link>
                </div>
            </div>
        </section>
    );
}
