import { auth } from '@/auth/auth';
import CustomLink from '@/components/custom-link';
import { Input } from '@/components/ui/input';
import { ADMIN, CREATOR, USER } from '@/lib/constant-value';
import { MenuType } from '@/types/nav';
import Image from 'next/image';
import {
    FaCartFlatbed,
    FaDollarSign,
    FaMagnifyingGlass,
    FaRegUser,
} from 'react-icons/fa6';
import CartCount from './card-item-count';
import CategoryMenus from './category-menus';

function Logo() {
    return (
        <li className="text-white ">
            <CustomLink href="/">
                <div className={``}>
                    <figure className="md:w-12 md:h-12 w-10 h-10 mx-auto rounded-full overflow-hidden border-2 border-ring animate-jump relative">
                        <Image
                            src="/assets/logo/mangrove-collection.png"
                            alt="Site logo"
                            className="w-full object-cover hover:scale-125 duration-300"
                            width={44}
                            height={44}
                        />
                    </figure>
                    <h2 className="font-bold text-primary-foreground text-sm md:text-base animate-fade-right">
                        Mangrove Collection
                    </h2>
                </div>
            </CustomLink>
        </li>
    );
}

function Search() {
    return (
        <li>
            <div className=" 2xl:w-[25rem] xl:w-[22rem] md:w-[13rem] sm:w-[22rem] w-[16rem] md:mt-0 mt-6  relative">
                <Input
                    type="text"
                    name="search"
                    id="search"
                    className="w-full placeholder:text-muted-foreground py-2 pl-3 focus:text-secondary-foreground rounded font-medium outline-none text-base"
                    placeholder="Search"
                />
                <div className="absolute top-2 z-10 right-3 text-muted-foreground hover:text-primary-foreground md:text-2xl text-xl hidden sm:block">
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
            <CustomLink
                className="hover:text-primary-foreground duration-150"
                href="/offers">
                <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 group">
                    <div className="text-primary-foreground xl:text-3xl md:text-2xl text-xl">
                        <FaDollarSign />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-medium">
                            Offers
                        </h2>
                        <p className="text-sm hidden md:block text-muted dark:text-neutral-300/90 duration-150 group-hover:text-primary-foreground">
                            Latest Offers
                        </p>
                    </div>
                </div>
            </CustomLink>{' '}
        </li>
    );
}

function Card() {
    return (
        <li className="text-white">
            {' '}
            <CustomLink href="/cart">
                <div
                    className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1
                hover:text-primary-foreground duration-150 group">
                    <div className="text-primary-foreground xl:text-3xl md:text-2xl text-xl">
                        <FaCartFlatbed />
                    </div>
                    <div>
                        <h2 className="sm:text-lg text-sm font-medium duration-150 group-hover:text-primary-foreground">
                            Cart
                            <CartCount />
                        </h2>
                        <p className="text-sm hidden md:block text-muted dark:text-neutral-300/90 group-hover:text-primary-foreground duration-150">
                            Add items
                        </p>
                    </div>
                </div>
            </CustomLink>{' '}
        </li>
    );
}

async function Account() {
    const session = await auth();

    if (session && session.user) {
        if (!session?.user) {
            return <div>Loading...</div>; // Or handle the case where user is null
        }

        const firstName = session?.user?.name.split(' ')[0];
        const fullName = session?.user?.name;
        // ADMIN or CREATOR OR USER url set
        let linkUrl = '';
        if (session?.user?.role === ADMIN || session?.user?.role === CREATOR)
            linkUrl = '/dashboard';
        if (session?.user?.role === USER) linkUrl = '/account';
        // ADMIN or CREATOR OR USER url set

        let userImage: React.ReactNode;
        if (session?.user?.image) {
            userImage = (
                <Image
                    src={session?.user?.image}
                    width={30}
                    height={30}
                    alt={fullName || ''}
                    className="md:w-[32px] md:h-[32px] w-[20px] h-[20px]"
                />
            );
        } else {
            userImage = (
                <span
                    className="uppercase bg-primary-foreground  text-white rounded-full
                md:text-2xl text-lg flex items-center justify-center md:w-[32px] md:h-[32px] w-[20px] h-[20px] ">
                    {session?.user?.name?.charAt(0)}
                </span>
            );
        }

        return (
            <li className="text-white">
                <CustomLink href={session?.user ? linkUrl : '/login'}>
                    <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                        <div className="text-primary-foreground lg:text-3xl text-xl">
                            {session?.user ? userImage : <FaRegUser />}
                        </div>
                        <div>
                            <h2 className="sm:text-lg text-sm font-medium">
                                {firstName}
                            </h2>
                            {session?.user ? (
                                <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                    {fullName}
                                </p>
                            ) : (
                                <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                    register or Login
                                </p>
                            )}
                        </div>
                    </div>
                </CustomLink>
            </li>
        );
    } else {
        return (
            <li className="text-white">
                <CustomLink href={'/login'}>
                    <div className="flex md:flex-row flex-col items-center xl:gap-3 md:gap-2 gap-1 hover:text-primary-foreground duration-150 group">
                        <div className="text-primary-foreground lg:text-3xl text-xl">
                            <FaRegUser />
                        </div>
                        <div>
                            <h2 className="sm:text-lg text-sm font-medium">
                                Account
                            </h2>

                            <p className="text-sm hidden md:block text-muted group-hover:text-primary-foreground dark:text-neutral-300/90 duration-150">
                                register or Login
                            </p>
                        </div>
                    </div>
                </CustomLink>
            </li>
        );
    }
}

function NavMenu() {
    const menuArray: MenuType[] = [
        { id: 'category', href: '#', label: 'Category' },
        { id: 'products', href: '/products', label: 'products' },
        { id: 'contact', href: '/#contact', label: 'contact' },
        { id: 'about', href: '/#about', label: 'about' },
    ];

    return (
        <>
            {menuArray?.map((items) => {
                return (
                    <li
                        key={items.id}
                        className={`capitalize hover:text-primary-foreground duration-200 border-b border-border md:py-3 md:border-none p-2 group/menu last:border-none dark:border-neutral-200/20 ${
                            items.id === 'category'
                                ? 'group/category relative duration-500 origin-top'
                                : ''
                        }`}>
                        {
                            <CustomLink
                                isActive={items.id !== 'category'}
                                href={items.href}
                                className="group-hover/menu:md:pl-0 group-hover/menu:pl-2  duration-150">
                                {items.label}
                            </CustomLink>
                        }

                        {items.id === 'category' && <CategoryMenus />}
                    </li>
                );
            })}
        </>
    );
}

export { Account, Card, Logo, NavMenu, Offer, Search };
