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
                className={`absolute top-[3.25rem] border rounded-sm h-52 bg-gray-100 duration-500 ${
                    menuShow ? '-left-[1.8rem]' : '-left-[20rem]'
                }`}>
                {children}
            </ul>
        </li>
    );
}
