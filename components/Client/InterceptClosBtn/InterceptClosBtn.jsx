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
            className="absolute top-1 right-1 text-neutral-600 rounded hover:scale-125 duration-300 ">
            <IoClose className="md:text-3xl text-xl" />
        </button>
    );
}

export { InterceptClosBtn, InterceptClosBtnOutSite };
