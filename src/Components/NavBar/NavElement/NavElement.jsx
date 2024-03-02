import {
    FaCartFlatbed,
    FaDollarSign,
    FaMagnifyingGlass,
    FaRegUser,
} from 'react-icons/fa6';
import { Link, NavLink } from 'react-router-dom';
import siteLogo from '../../../assets/logo/mangrove-collection.png';

const user = null;

function Logo() {
    return (
        <li className="text-white">
            <Link to="/">
                <div className="">
                    <figure className="w-12 h-12 mx-auto rounded-full overflow-hidden border-2 border-primaryColor ">
                        <img
                            src={siteLogo}
                            alt="Site logo"
                            className="w-full object-cover hover:scale-125 duration-300"
                        />
                    </figure>
                    <h2 className="font-bold text-primaryColor">
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
            <Link>
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
            <NavLink
                to="/cart-items"
                className={({ isActive }) => (isActive ? 'active' : '')}>
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
            <NavLink
                to={user ? '/dashboard' : '/login'}
                className={({ isActive }) => (isActive ? 'active' : '')}>
                <div className="flex md:flex-row flex-col items-center sm:gap-3 gap-1">
                    <div className="text-primaryColor text-3xl">
                        {user ? (
                            user?.photoURL ? (
                                <img
                                    className="rounded-full w-10 h-10 object-cover"
                                    src={user?.photoURL}
                                    alt={
                                        user?.displayName
                                            ? user?.displayName
                                            : 'User Image'
                                    }
                                />
                            ) : (
                                <FaRegUser />
                            )
                        ) : (
                            <FaRegUser />
                        )}
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

export { Account, Card, Logo, Offer, Search };
