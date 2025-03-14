import { auth } from '@/auth';
import CustomLink from '@/components/custom-link';

import { FaRegUser } from 'react-icons/fa6';

export default async function Account() {
    const session = await auth();
    const firstName = session?.user?.name?.split(' ')[0] || 'Name';
    if (session) {
        return (
            <li className="text-white">
                <CustomLink href={'/profile'}>
                    <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                        <div className="text-primary-foreground lg:text-3xl text-xl">
                            <FaRegUser />
                        </div>
                        <div>
                            <h2 className="sm:text-lg text-sm font-medium">
                                {firstName}
                            </h2>

                            <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                {session?.user.email}
                            </p>
                        </div>
                    </div>
                </CustomLink>
            </li>
        );
    }

    if (!session) {
        return (
            <>
                <li className="text-white">
                    <CustomLink href={'/login'}>
                        <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                            <div className="text-primary-foreground lg:text-3xl text-xl">
                                <FaRegUser />
                            </div>
                            <div>
                                <h2 className="sm:text-lg text-sm font-medium">
                                    Account
                                </h2>

                                <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                    Register or Login
                                </p>
                            </div>
                        </div>
                    </CustomLink>
                </li>
            </>
        );
    }
}
