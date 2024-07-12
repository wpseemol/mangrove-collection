import afterLogin from '@/app/actions/afterLogin/afterLogin';
import { Suspense } from 'react';
import Account from '../../Client/Account/Account';
import { Card, Logo, NavMenu, Offer, Search } from '../NavElement/NavElement';

export default async function NavBigScreen() {
    const loginUser = await afterLogin();

    return (
        <nav className="hidden md:block">
            <div className="">
                <div className="bg-black py-2 fixed top-0 left-0 w-full z-30">
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
                            <Account loginUser={loginUser} />
                        </Suspense>
                    </ul>
                </div>
                <div className="hidden md:block h-[5.4rem] w-full"></div>
            </div>
            <div className="shadow-lg">
                <ul className="w-fit text-base font-medium flex items-center mx-auto gap-5 ">
                    <NavMenu />
                </ul>
            </div>
        </nav>
    );
}
