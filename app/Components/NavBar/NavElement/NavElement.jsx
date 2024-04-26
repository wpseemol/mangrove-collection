import siteLogo from '@/public/assets/logo/mangrove-collection.png';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaCartFlatbed,
    FaDollarSign,
    FaMagnifyingGlass,
    FaRegUser,
} from 'react-icons/fa6';
import NavLink from '../../Client/NavLink/NavLink';

const user = null;

function Logo() {
    return (
        <li className="text-white">
            <Link href="/">
                <div className="">
                    <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-primaryColor ">
                        <Image
                            src={siteLogo}
                            alt="Site logo"
                            className="w-full object-cover hover:scale-125 duration-300"
                        />
                    </figure>
                    <h2 className="font-bold text-primaryColor text-sm md:text-base">
                        Mangrove Collection
                    </h2>
                </div>
            </Link>
        </li>
    );
}

function Search() {
    return (
        <li>
            <div className=" 2xl:w-[25rem] xl:w-[22rem] md:w-[18rem] sm:w-[22rem] w-[16rem] md:mt-0 mt-6  relative">
                <input
                    type="text"
                    name="search"
                    id="searchIcon"
                    className="w-full text-gray-600 py-2 pl-3 rounded-md font-semibold outline-none"
                    placeholder="Search"
                />
                <div className="absolute top-2 z-10 right-3 text-primaryColor text-2xl hidden sm:block">
                    <FaMagnifyingGlass />
                </div>
            </div>
        </li>
    );
}

function Offer() {
    return (
        <li className="text-white">
            {' '}
            <Link
                className="hover:text-primaryColor duration-300"
                href="/offers">
                <div className="flex md:flex-row flex-col items-center sm:gap-3 gap-1">
                    <div className="text-primaryColor text-3xl">
                        <FaDollarSign />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-semibold">
                            Offers
                        </h2>
                        <p className="text-sm hidden md:block">Latest Offers</p>
                    </div>
                </div>
            </Link>{' '}
        </li>
    );
}

function Card() {
    const cardDataLength = 0;

    return (
        <li className="text-white">
            {' '}
            <NavLink href="/cart-items">
                <div className="flex md:flex-row flex-col items-center sm:gap-3 gap-1">
                    <div className="text-primaryColor text-3xl">
                        <FaCartFlatbed />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-semibold">
                            Cart
                            <span>{user ? `(${cardDataLength})` : ''}</span>
                        </h2>
                        <p className="text-sm hidden md:block">Add items</p>
                    </div>
                </div>
            </NavLink>{' '}
        </li>
    );
}

function Account() {
    return (
        <li className="text-white">
            {' '}
            <NavLink href={'/login'}>
                <div className="flex md:flex-row flex-col items-center sm:gap-3 gap-1">
                    <div className="text-primaryColor text-3xl">
                        <FaRegUser />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-semibold">
                            Account
                        </h2>
                        {user ? (
                            <p className="text-sm hidden md:block">
                                {user?.email}
                            </p>
                        ) : (
                            <p className="text-sm hidden md:block">
                                register or Login
                            </p>
                        )}
                    </div>
                </div>
            </NavLink>{' '}
        </li>
    );
}

function NavMenu() {
    const menuArray = [
        { id: 1, link: '', name: 'brand' },
        { id: 2, href: '/#contact', name: 'contact' },
        { id: 3, link: '', name: 'products' },
        { id: 4, link: '', name: 'about' },
    ];
    return (
        <>
            {menuArray?.map((items) => {
                console.log(items?.href);

                return (
                    <li
                        key={items.id}
                        className="capitalize last:border-none hover:text-primaryColor duration-200 border-b border-black p-2 md:p-0 md:border-none pr-36">
                        {items?.href ? (
                            <a href={items?.href}>{items.name}</a>
                        ) : (
                            <Link href={items?.link}>{items.name}</Link>
                        )}
                    </li>
                );
            })}
        </>
    );
}

export { Account, Card, Logo, NavMenu, Offer, Search };
