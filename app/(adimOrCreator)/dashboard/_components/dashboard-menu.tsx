'use client';
import DashboardLink from '@/components/dashboard-link';
import { ADMIN, CREATOR } from '@/lib/constant-value';
import { UserType } from '@/types/auth';
import { FaUpload } from 'react-icons/fa';
import { FaUsersGear } from 'react-icons/fa6';
import { ImProfile } from 'react-icons/im';
import { IoSettings } from 'react-icons/io5';
import { TbHelpHexagonFilled } from 'react-icons/tb';

export default function DashboardMenu({
    isDryerClose,
    user,
}: {
    isDryerClose: boolean;
    user: UserType;
}) {
    let menuArrays: MenuArraysType[] = [];

    switch (user?.role) {
        case ADMIN:
            menuArrays = adminMenus;
            break;
        case CREATOR:
            menuArrays = creatorMenus;
            break;
    }

    return (
        <ul className="">
            {menuArrays.map((menu) => (
                <li key={menu?.id} className="my-1 mx-auto ">
                    <DashboardLink href={menu?.href}>
                        <p className="flex item-center text-xl gap-3 py-3 px-1">
                            <span className="text-2xl">{menu?.icon} </span>
                            <span
                                className={`${
                                    isDryerClose ? 'sm:hidden' : ''
                                }`}>
                                {menu?.name}
                            </span>
                        </p>
                    </DashboardLink>
                </li>
            ))}
        </ul>
    );
}

interface MenuArraysType {
    href: string;
    icon: JSX.Element;
    name: string;
    id: number;
}

const adminMenus: MenuArraysType[] = [
    {
        href: '/dashboard/add-product',
        icon: <FaUpload />,
        name: 'Add Product',
        id: 1,
    },
    {
        href: '/dashboard/users',
        icon: <FaUsersGear />,
        name: 'Manage All User',
        id: 2,
    },

    {
        href: '/dashboard/profile',
        icon: <ImProfile />,
        name: 'Profile',
        id: 3,
    },
    {
        href: '/dashboard/setting',
        icon: <IoSettings />,
        name: 'Setting',
        id: 4,
    },
    {
        href: '/dashboard/help',
        icon: <TbHelpHexagonFilled />,
        name: 'Help',
        id: 5,
    },
];

const creatorMenus: MenuArraysType[] = [
    {
        href: '/dashboard/add-product',
        icon: <FaUpload />,
        name: 'Add Product',
        id: 1,
    },
    {
        href: '/dashboard/profile',
        icon: <ImProfile />,
        name: 'Profile',
        id: 2,
    },
    {
        href: '/dashboard/help',
        icon: <TbHelpHexagonFilled />,
        name: 'Help',
        id: 3,
    },
];
