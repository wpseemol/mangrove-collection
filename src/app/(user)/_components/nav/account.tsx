// import { auth } from '@/auth/auth';
import CustomLink from '@/components/custom-link';
// import { ADMIN, CREATOR, USER } from '@/lib/constant-value';
import Image from 'next/image';
import React from 'react';
import { FaRegUser } from 'react-icons/fa6';

export default async function Account() {
    const session = false;

    if (session && session.user) {
        if (!session?.user) {
            return <div>Loading...</div>; // Or handle the case where user is null
        }

        const firstName = session?.user?.name.split(' ')[0];
        const fullName = session?.user?.name;
        // ADMIN or CREATOR OR USER url set
        let linkUrl = '';
        if (session?.user?.role === ADMIN || session?.user?.role === CREATOR)
            linkUrl = '/dashboard';
        if (session?.user?.role === USER) linkUrl = '/account';
        // ADMIN or CREATOR OR USER url set

        let userImage: React.ReactNode;
        if (session?.user?.image) {
            userImage = (
                <Image
                    src={session?.user?.image}
                    width={30}
                    height={30}
                    alt={fullName || ''}
                    className="md:w-[32px] md:h-[32px] w-[20px] h-[20px]"
                />
            );
        } else {
            userImage = (
                <span
                    className="uppercase bg-primary-foreground  text-white rounded-full
                md:text-2xl text-lg flex items-center justify-center md:w-[32px] md:h-[32px] w-[20px] h-[20px] ">
                    {session?.user?.name?.charAt(0)}
                </span>
            );
        }

        return (
            <li className="text-white">
                <CustomLink href={session?.user ? linkUrl : '/login'}>
                    <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                        <div className="text-primary-foreground lg:text-3xl text-xl">
                            {session?.user ? userImage : <FaRegUser />}
                        </div>
                        <div>
                            <h2 className="sm:text-lg text-sm font-medium">
                                {firstName}
                            </h2>
                            {session?.user ? (
                                <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                    {fullName}
                                </p>
                            ) : (
                                <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                    register or Login
                                </p>
                            )}
                        </div>
                    </div>
                </CustomLink>
            </li>
        );
    } else {
        return (
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
                                register or Login
                            </p>
                        </div>
                    </div>
                </CustomLink>
            </li>
        );
    }
}
