import Image from 'next/image';
import Link from 'next/link';

import siteLogo from '@/public/assets/logo/mangrove-collection.png';

export default function DashboardSiteLogo({ isDryerClose, mobileView }) {
    return (
        <Link href="/">
            <div className={`flex gap-1 items-center`}>
                <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-primaryColor ">
                    <Image
                        src={siteLogo}
                        alt="Site logo"
                        className="w-full object-cover hover:scale-125 duration-300"
                    />
                </figure>
                <h2
                    className={`font-bold text-primaryColor text-sm md:text-base
                                    ${isDryerClose ? 'sm:hidden block' : ''}
                                    `}>
                    Mangrove Collection
                </h2>
            </div>
        </Link>
    );
}
