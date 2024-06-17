'use client';
import { useState } from 'react';
import { FaBars, FaX } from 'react-icons/fa6';

export default function MenuBtn({ children }) {
    const [menuShow, setMenuShow] = useState(false);

    return (
        <li className={`relative `}>
            <div
                className=" text-white text-2xl"
                onClick={() => setMenuShow(!menuShow)}>
                {menuShow ? <FaX /> : <FaBars />}
            </div>
            <ul
                className={`absolute top-[3.25rem] border rounded-sm h-fit text-xl font-semibold text-neutral-700 bg-gray-100 duration-500 w-screen ${
                    menuShow ? '-left-[2rem]' : 'sm:-left-[60rem] -left-[45rem]'
                }`}>
                {children}
            </ul>
        </li>
    );
}
