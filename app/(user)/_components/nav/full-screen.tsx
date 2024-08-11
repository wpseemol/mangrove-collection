import { Suspense } from 'react';

import { Account, Card, Logo, NavMenu, Offer, Search } from './nav-elements';

export default async function FullScreen() {
    return (
        <nav className="hidden md:block">
            <div className="">
                <div className="bg-neutral-800/90 dark:bg-neutral-900/65 dark:border-y dark:border-neutral-800 py-2 fixed top-0 left-0 w-full z-30">
                    <ul className="container mx-auto flex justify-evenly items-center">
                        {/* logo  */}
                        <Logo />

                        {/* search  */}
                        <Search />

                        {/* offer */}
                        <Offer />

                        {/* card */}
                        <Card />

                        {/* account */}
                        <Suspense fallback={<p>loading...</p>}>
                            <Account />
                        </Suspense>
                    </ul>
                </div>
                <div className="hidden md:block h-[5.4rem] w-full"></div>
            </div>
            <div className="border-b shadow">
                <ul className="w-fit text-base font-medium flex items-center mx-auto gap-5 ">
                    <NavMenu />
                </ul>
            </div>
        </nav>
    );
}