import Image from 'next/image';
import Link from 'next/link';

import siteLogo from '@/public/assets/logo/mangrove-collection.png';

export default function DashboardSiteLogo({
    isDryerClose,
}: {
    isDryerClose: boolean;
}) {
    return (
        <section className={`flex gap-2 items-center`}>
            <Link href="/">
                <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-primary-foreground">
                    <Image
                        src={siteLogo}
                        alt="Site logo"
                        className="w-full object-cover hover:scale-125 duration-300"
                    />
                </figure>
            </Link>
            <Link href="/dashboard">
                <h2
                    className={`font-bold text-primary-foreground text-sm md:text-base
                        ${isDryerClose ? 'sm:hidden block' : ''}
                        `}>
                    Mangrove Collection
                    <br />
                    Dashboard
                </h2>
            </Link>
        </section>
    );
}
