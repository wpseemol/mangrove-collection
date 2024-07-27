'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function TabBtn({ href, title }) {
    const router = useRouter();
    const pathName = usePathname();

    function handelChangUrl() {
        router.push(href);
    }

    return (
        <button
            onClick={handelChangUrl}
            className={`${
                href === pathName
                    ? 'border-b-primaryColor border-b-2 -mb-[1px] duration-300'
                    : ''
            } px-5 py-3 duration-200`}>
            {title}
        </button>
    );
}
