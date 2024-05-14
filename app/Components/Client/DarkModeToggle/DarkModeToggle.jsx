import { useEffect, useState } from 'react';

import { MdOutlineLightMode, MdOutlineNightlight } from 'react-icons/md';

export default function DarkModeToggle() {
    const [darkMode, setDarkMode] = useState(true);

    useEffect(() => {
        const darkModeLoc = localStorage?.getItem('darkMode');

        if (darkModeLoc === 'light') {
            setDarkMode(false);
        } else if (darkModeLoc === 'dark') {
            setDarkMode(true);
        } else {
            setDarkMode(true);
        }

        document.body.classList.toggle('dark', !darkMode);
    }, [darkMode]);

    const toggleDarkBode = () => {
        if (darkMode) {
            localStorage?.setItem('darkMode', 'light');
            setDarkMode(false);
        } else {
            localStorage?.setItem('darkMode', 'dark');
            setDarkMode(true);
        }
    };

    return (
        <button onClick={toggleDarkBode}>
            {!darkMode ? (
                <div className="p-3 text-xl rounded-full hover:shadow-2xl text-[#9a9b9b] duration-300 hover:scale-110 ">
                    <MdOutlineLightMode />
                </div>
            ) : (
                <div className="p-3 text-xl rounded-full hover:shadow-2xl text-[#343535] duration-300 hover:scale-110 hover:border">
                    <MdOutlineNightlight />
                </div>
            )}
        </button>
    );
}
