'use client';

import { useEffect, useState } from 'react';
import { FaListUl } from 'react-icons/fa6';
import { SlGrid } from 'react-icons/sl';

export default function ProductViewChange({
    children,
    listViewCard,
}: {
    children: React.ReactNode;
    listViewCard: React.ReactNode;
}) {
    const [isGridView, setIsGridView] = useState('gird');

    useEffect(() => {
        const isCardView = sessionStorage.getItem('card-view');

        if (isCardView) {
            setIsGridView(isCardView);
        }
    }, []);

    return (
        <section className="col-span-4">
            <div className="border-b w-full flex gap-2 items-center pb-3">
                <button
                    title="Grid view"
                    onClick={() => {
                        setIsGridView('gird');
                        sessionStorage.removeItem('card-view');
                    }}
                    className={`${
                        isGridView === 'gird'
                            ? 'bg-primary hover:bg-primary-foreground text-neutral-100'
                            : 'hover:bg-slate-200/80'
                    } border p-2 text-nowrap rounded-sm duration-150`}>
                    <SlGrid />
                </button>
                <button
                    title="List view"
                    onClick={() => {
                        setIsGridView('list');
                        sessionStorage.setItem('card-view', 'list');
                    }}
                    className={`${
                        isGridView === 'list'
                            ? 'bg-primary hover:bg-primary-foreground text-neutral-100'
                            : 'hover:bg-slate-200/80'
                    } border p-2 text-nowrap rounded-sm duration-150`}>
                    <FaListUl />
                </button>
            </div>
            <>
                {isGridView === 'gird' && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mt-8 print:mt-4 print:sm:grid-cols-5 print:gap-1">
                        {children}
                    </div>
                )}
                {isGridView === 'list' && (
                    <div className="mt-8 space-y-4">{listViewCard}</div>
                )}
            </>
        </section>
    );
}
