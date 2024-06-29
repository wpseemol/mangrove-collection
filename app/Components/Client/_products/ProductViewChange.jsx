'use client';

import { useEffect, useState } from 'react';
import { FaListUl } from 'react-icons/fa6';
import { SlGrid } from 'react-icons/sl';

export default function ProductViewChange({ children, ListViewCard }) {
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
                    className="border p-2 text-nowrap rounded-sm">
                    <SlGrid />
                </button>
                <button
                    title="List view"
                    onClick={() => {
                        setIsGridView('list');
                        sessionStorage.setItem('card-view', 'list');
                    }}
                    className="border p-2 text-nowrap rounded-sm">
                    <FaListUl />
                </button>
            </div>
            <div
                className={`flex flex-wrap mt-4 ${
                    isGridView === 'gird' ? ' items-center gap-3' : ''
                } ${isGridView === 'list' ? ' flex-col gap-y-5' : ''}`}>
                {isGridView === 'gird' && children}
                {isGridView === 'list' && ListViewCard}
            </div>
        </div>
    );
}
