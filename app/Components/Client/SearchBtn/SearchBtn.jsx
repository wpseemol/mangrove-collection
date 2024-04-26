'use client';

import { useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';

export default function SearchBtn({ children }) {
    const [menuShow, setMenuShow] = useState(false);

    return (
        <li className="">
            <div
                className={`text-primaryColor text-2xl`}
                onClick={() => setMenuShow(!menuShow)}>
                <FaMagnifyingGlass className="text-white" />
            </div>
            {menuShow && (
                <>
                    <div
                        onClick={() => setMenuShow(!menuShow)}
                        className="absolute top-0 left-0 w-full h-screen  bg-black/25 flex justify-center"></div>
                    <div className="absolute top-0 left-1/2 -translate-x-1/2">
                        {/* search  */}

                        {children}
                    </div>
                </>
            )}
        </li>
    );
}
