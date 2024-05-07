'use client';

import { useState } from 'react';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';

export default function PasswordShowHidden({
    where,
    handelRegister,
    className,
}) {
    const [passShow, setPassShow] = useState(false);
    return (
        <span className="relative">
            <span
                title={passShow ? 'Hidden Password' : 'Show Password'}
                className="absolute top-0 right-3 cursor-pointer text-lg"
                onClick={() => setPassShow((isTrue) => !isTrue)}>
                {!passShow ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
            </span>
            <input
                onChange={(e) => {
                    where === 'register' && handelRegister(e, 'onChange');
                }}
                type={passShow ? 'text' : 'password'}
                name="password"
                id="password"
                placeholder={passShow ? 'password' : '********'}
                className={where === 'register' ? className : ''}
            />
        </span>
    );
}
