'use client';

import { useAuth } from '@/app/hooks';
import userType from '@/utils/userType';
import { GrTest } from 'react-icons/gr';
import DashboardLink from '../Client/DashboardLink/DashboardLink';

export default function DashboardMenu({ isDryerClose }) {
    const [auth] = useAuth();

    const userTypeCake = userType(auth);

    let menuArrays = [];
    if (userTypeCake?.type === 'admin') {
        menuArrays = [
            { href: '/dashboard/test', icon: <GrTest />, name: 'test', id: 1 },
        ];
    } else if (userTypeCake?.type === 'contentCreator') {
        menuArrays = 'Content Creator';
    }

    return (
        <div>
            <ul>
                {menuArrays.map((menu) => (
                    <li key={menu?.id} className="flex">
                        <DashboardLink href={menu?.href}>
                            <p className="flex item-center gap-2">
                                {menu?.icon}{' '}
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
        </div>
    );
}
