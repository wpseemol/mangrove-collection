import MenuBtn from './menu-btn';
import { Account, Card, Logo, NavMenu, Offer, Search } from './nav-elements';
import SearchBtn from './search-btn';

export default function MobileScreen() {
    return (
        <>
            <nav className="md:hidden ">
                <div>
                    <ul className=" flex justify-between items-center py-2 bg-black w-full fixed z-10 top-0 px-8 border-b dark:border-neutral-200/20">
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
                    <ul className="fixed bottom-0 z-[9] bg-black py-2 flex w-full justify-evenly border-t border-neutral-200/20">
                        {/* offer */}
                        <Offer />

                        {/* card */}
                        <Card />

                        {/* account */}

                        <Account />
                    </ul>
                </div>
            </nav>
        </>
    );
}
