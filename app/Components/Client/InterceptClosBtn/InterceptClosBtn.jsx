'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { IoClose } from 'react-icons/io5';

const handelClose = (router) => {
    router.back();
};

function InterceptClosBtnOutSite() {
    const router = useRouter();

    const onkeydown = useCallback(
        (e) => {
            if (e.key === 'Escape') {
                router.back();
            }
        },
        [router]
    );

    useEffect(() => {
        document.addEventListener('keydown', onkeydown);

        return () => document.removeEventListener('keydown', onkeydown);
    }, [onkeydown]);

    return (
        <div
            onClick={() => handelClose(router)}
            className="absolute top-0 left-0 w-full h-full z-10"></div>
    );
}

function InterceptClosBtn() {
    const router = useRouter();
    return (
        <button
            onClick={() => handelClose(router)}
            className="absolute top-3 right-3 bg-red-500 text-neutral-800 dark:text-neutral-200 rounded hover:scale-125 duration-300">
            <IoClose className="text-4xl" />
        </button>
    );
}

export { InterceptClosBtn, InterceptClosBtnOutSite };
