'use client';

import { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export default function SearchBtn({ children }: { children: React.ReactNode }) {
    const [menuShow, setMenuShow] = useState<boolean>(false);

    return (
        <li className="">
            <div
                className={`text-primaryColor text-2xl`}
                onClick={() => setMenuShow(!menuShow)}>
                <FaMagnifyingGlass className="text-white" />
            </div>
            {menuShow && (
                <>
                    {/* this close btn  */}
                    <div
                        onClick={() => setMenuShow(!menuShow)}
                        className="absolute top-0 left-0 w-full h-screen z-[5] bg-black/25 flex justify-center"></div>
                    {/* this close btn  */}
                    <ul className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
                        {/* search  */}

                        {children}
                    </ul>
                </>
            )}
        </li>
    );
}
