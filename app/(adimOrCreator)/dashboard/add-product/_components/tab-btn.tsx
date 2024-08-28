'use client';

import { usePathname, useRouter } from 'next/navigation';

export default function TabBtn({
    href,
    title,
}: {
    href: string;
    title: string;
}) {
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
                    ? 'border-b-primary-foreground border-b-2 -mb-[1px] text-primary-foreground font-medium border rounded-t-lg '
                    : 'border-b-transparent'
            } border-b-2 border px-5 py-3 duration-200 font-medium hover:text-primary-foreground -mb-[1px] border-transparent`}>
            {title}
        </button>
    );
}
