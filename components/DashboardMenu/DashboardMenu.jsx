'use client';

import { useAuth } from '@/app/hooks';
import userType from '@/utils/userType';
import { FaUpload } from 'react-icons/fa';
import { FaUsersGear } from 'react-icons/fa6';
import { ImProfile } from 'react-icons/im';
import { IoSettings } from 'react-icons/io5';
import { TbHelpHexagonFilled } from 'react-icons/tb';
import DashboardLink from '../Client/DashboardLink/DashboardLink';

export default function DashboardMenu({ isDryerClose }) {
    const [auth] = useAuth();

    const userTypeCake = userType(auth);

    let menuArrays = [];
    if (userTypeCake?.type === 'admin') {
        menuArrays = [
            {
                href: '/dashboard/upload-product',
                icon: <FaUpload />,
                name: 'Upload Product',
                id: 1,
            },
            {
                href: '/dashboard/users',
                icon: <FaUsersGear />,
                name: 'Manage All User',
                id: 2,
            },
            {
                href: '/dashboard/add-product',
                icon: <FaUpload />,
                name: 'Add Product',
                id: 3,
            },
            {
                href: '/dashboard/profile',
                icon: <ImProfile />,
                name: 'Profile',
                id: 4,
            },
            {
                href: '/dashboard/setting',
                icon: <IoSettings />,
                name: 'Setting',
                id: 5,
            },
            {
                href: '/dashboard/help',
                icon: <TbHelpHexagonFilled />,
                name: 'Help',
                id: 6,
            },
        ];
    } else if (userTypeCake?.type === 'contentCreator') {
        menuArrays = [
            {
                href: '/dashboard/upload-product',
                icon: <FaUpload />,
                name: 'Upload Product',
                id: 1,
            },

            {
                href: '/dashboard/profile',
                icon: <ImProfile />,
                name: 'Profile',
                id: 2,
            },
            {
                href: '/dashboard/add-product',
                icon: <FaUpload />,
                name: 'Add Product',
                id: 3,
            },

            {
                href: '/dashboard/help',
                icon: <TbHelpHexagonFilled />,
                name: 'Help',
                id: 4,
            },
        ];
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
