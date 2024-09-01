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
        <div className="">
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
            <div
                className={`flex flex-wrap mt-4 2xl:gap-x-5 gap-y-4  md:gap-x-4 gap-x-2 ${
                    isGridView === 'gird'
                        ? ' items-center md:justify-start justify-center'
                        : ''
                } ${isGridView === 'list' ? ' flex-col ' : ''}`}>
                {isGridView === 'gird' && children}
                {isGridView === 'list' && listViewCard}
            </div>
        </div>
    );
}
