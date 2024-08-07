import InputField from '@/components/Client/input/input-field';
import { useState } from 'react';
import { PiEyeClosedDuotone, PiEyeDuotone } from 'react-icons/pi';

export default function PasswordField({ form }) {
    const [isHidden, setIsHidden] = useState(false);

    return (
        <>
            <span
                onClick={() => setIsHidden((prev) => !prev)}
                className="absolute right-4 top-12">
                {isHidden ? <PiEyeDuotone /> : <PiEyeClosedDuotone />}
            </span>
            <InputField
                form={form}
                name="password"
                type={isHidden ? 'text' : 'password'}
                label="Password"
                placeholder={isHidden ? 'Password' : '********'}
            />
        </>
    );
}
