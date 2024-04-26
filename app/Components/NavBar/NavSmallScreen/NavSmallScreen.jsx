import MenuBtn from '../../Client/MenuBtn/MenuBtn';
import SearchBtn from '../../Client/SearchBtn/SearchBtn';
import {
    Account,
    Card,
    Logo,
    NavMenu,
    Offer,
    Search,
} from '../NavElement/NavElement';

export default function NavSmallScreen() {
    return (
        <div>
            <nav className="md:hidden">
                <div>
                    <ul className="  flex justify-between items-center py-2 bg-black w-full fixed z-50 top-0 px-8">
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
                        <Account />
                    </ul>
                </div>
            </nav>
        </div>
    );
}
