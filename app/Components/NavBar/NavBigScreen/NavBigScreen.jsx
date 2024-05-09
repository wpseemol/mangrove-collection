import Account from '../../Client/Account/Account';
import { Card, Logo, NavMenu, Offer, Search } from '../NavElement/NavElement';

export default function NavBigScreen() {
    return (
        <nav className="hidden md:block">
            <div className="">
                <div className="bg-black py-2 fixed top-0 left-0 w-full z-10">
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
                        <Account />
                    </ul>
                </div>
                <div className="hidden md:block h-[5.4rem] w-full"></div>
            </div>
            <div className="shadow-lg">
                <ul className="w-fit mx-auto text-base font-medium py-2  flex items-center gap-5">
                    <NavMenu />
                </ul>
            </div>
        </nav>
    );
}
