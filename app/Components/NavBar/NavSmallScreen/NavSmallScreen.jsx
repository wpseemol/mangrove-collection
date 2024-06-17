import afterLogin from '@/app/actions/afterLogin/afterLogin';
import { Suspense } from 'react';
import Account from '../../Client/Account/Account';
import MenuBtn from '../../Client/MenuBtn/MenuBtn';
import SearchBtn from '../../Client/SearchBtn/SearchBtn';
import { Card, Logo, NavMenu, Offer, Search } from '../NavElement/NavElement';

export default async function NavSmallScreen() {
    const loginUser = await afterLogin();
    return (
        <div>
            <nav className="md:hidden">
                <div>
                    <ul className=" flex justify-between items-center py-2 bg-black w-full fixed z-10 top-0 px-8">
                        {/* small screen menu button  */}

                        <MenuBtn>
                            <NavMenu />
                        </MenuBtn>

                        {/* logo  */}
                        <Logo />

                        {/* small screen search btn */}
                        <SearchBtn>
                            <Search />
                        </SearchBtn>
                    </ul>

                    <div className="w-ful h-[5rem] "> </div>
                </div>

                <div>
                    <ul className="fixed bottom-0 z-50 bg-black py-2 flex w-full justify-evenly">
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
            </nav>
        </div>
    );
}
