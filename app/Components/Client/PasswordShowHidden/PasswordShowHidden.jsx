'use client';

import { useState } from 'react';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';

export default function PasswordShowHidden(children) {
    const [passShow, setPassShow] = useState(false);
    return (
        <span className="relative">
            <div
                className="absolute top-0 right-3 cursor-pointer text-lg"
                onClick={() => setPassShow((isTrue) => !isTrue)}>
                {!passShow ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
            </div>
            <input
                type={passShow ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder={passShow ? 'password' : '********'}
                className="w-full px-3 py-2 border rounded-md border-gray-300 bg-gray-50 text-gray-800"
            />
        </span>
    );
}
