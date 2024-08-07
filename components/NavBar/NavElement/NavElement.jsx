import CategoryMenus from '@/components/CategoryMenus/CategoryMenus';
import AnimationLink from '@/components/page-change-animation/animation-link';
import siteLogo from '@/public/assets/logo/mangrove-collection.png';
import Image from 'next/image';
import Link from 'next/link';
import {
    FaCartFlatbed,
    FaDollarSign,
    FaMagnifyingGlass,
} from 'react-icons/fa6';

const user = null;

function Logo() {
    return (
        <li className="text-white ">
            <Link href="/">
                <div className={``}>
                    <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-primaryColor animate-jump">
                        <Image
                            src={siteLogo}
                            alt="Site logo"
                            className="w-full object-cover hover:scale-125 duration-300"
                        />
                    </figure>
                    <h2 className="font-bold text-primaryColor text-sm md:text-base animate-fade-right">
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
            <div className=" 2xl:w-[25rem] xl:w-[22rem] md:w-[13rem] sm:w-[22rem] w-[16rem] md:mt-0 mt-6  relative">
                <input
                    type="text"
                    name="search"
                    id="searchIcon"
                    className="w-full text-gray-600 py-2 pl-3 rounded-md font-semibold outline-none"
                    placeholder="Search"
                />
                <div className="absolute top-2 z-10 right-3 text-primaryColor md:text-2xl text-xl hidden sm:block">
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
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1">
                    <div className="text-primaryColor xl:text-3xl md:text-2xl text-xl">
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
            <AnimationLink href="/cart-items">
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1">
                    <div className="text-primaryColor xl:text-3xl md:text-2xl text-xl">
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
            </AnimationLink>{' '}
        </li>
    );
}

function NavMenu() {
    const menuArray = [
        { id: 'category', link: '/category', name: 'Category' },
        { id: 'products', link: '/products', name: 'products' },
        { id: 'contact', link: '/#contact', name: 'contact' },
        { id: 'about', link: '/#about', name: 'about' },
    ];
    return (
        <>
            {menuArray?.map((items) => {
                return (
                    <li
                        key={items.id}
                        className={`capitalize hover:text-primaryColor duration-200 border-b border-black md:py-3 md:border-none p-2 group/menu ${
                            items.id === 'category'
                                ? 'group/category relative duration-500 origin-top'
                                : ''
                        }`}>
                        {
                            <AnimationLink
                                isActive={items.id !== 'category'}
                                href={items?.link}
                                className="group-hover/menu:md:pl-0 group-hover/menu:pl-2  duration-150">
                                {items.name}
                            </AnimationLink>
                        }

                        {items.id === 'category' && <CategoryMenus />}
                    </li>
                );
            })}
        </>
    );
}

export { Card, Logo, NavMenu, Offer, Search };
