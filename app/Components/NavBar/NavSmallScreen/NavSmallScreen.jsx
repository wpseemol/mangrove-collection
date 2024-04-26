'use client';

import { useState } from 'react';
import { FaBars, FaMagnifyingGlass, FaX } from 'react-icons/fa6';
import {
    Account,
    Card,
    Logo,
    NavMenu,
    Offer,
    Search,
} from '../NavElement/NavElement';

export default function NavSmallScreen() {
    const [menuShow, setMenuShow] = useState(false);
    const [clickSearch, setClickSearch] = useState(false);

    return (
        <div>
            <nav className="md:hidden">
                <div>
                    <ul className="  flex justify-between items-center py-2 bg-black w-full fixed z-50 top-0 px-8">
                        {/* menu icon */}
                        <li className={`relative `}>
                            <div
                                className=" text-white text-2xl"
                                onClick={() => setMenuShow(!menuShow)}>
                                {menuShow ? <FaX /> : <FaBars />}
                            </div>
                            <ul
                                className={`absolute top-[3.25rem] border rounded-sm h-52 bg-gray-100 duration-500 ${
                                    menuShow
                                        ? '-left-[1.8rem]'
                                        : '-left-[20rem]'
                                }`}>
                                <NavMenu />
                            </ul>
                        </li>

                        {/* logo  */}
                        <Logo />

                        <li className="">
                            <div
                                className={`text-primaryColor text-2xl  ${
                                    menuShow && 'opacity-25'
                                }`}
                                onClick={() =>
                                    !menuShow && setClickSearch(!clickSearch)
                                }>
                                <FaMagnifyingGlass className="text-white" />
                            </div>
                            {clickSearch && (
                                <>
                                    <div
                                        onClick={() =>
                                            setClickSearch(!clickSearch)
                                        }
                                        className="absolute top-0 left-0 w-full h-screen  bg-black/25 flex justify-center"></div>
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                                        {/* search  */}
                                        <Search />
                                    </div>
                                </>
                            )}
                        </li>
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
