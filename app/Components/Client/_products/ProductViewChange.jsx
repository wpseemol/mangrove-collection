'use client';

import { useState } from 'react';
import { FaListUl } from 'react-icons/fa6';
import { SlGrid } from 'react-icons/sl';

export default function ProductViewChange({ children, ListViewCard }) {
    const [isGridView, setIsGridView] = useState('gird');

    return (
        <div className="">
            <div className="border-b w-full flex gap-2 items-center pb-3">
                <button
                    onClick={() => setIsGridView('gird')}
                    className="border p-2 text-nowrap rounded-sm">
                    <SlGrid />
                </button>
                <button
                    onClick={() => setIsGridView('list')}
                    className="border p-2 text-nowrap rounded-sm">
                    <FaListUl />
                </button>
            </div>
            <div
                className={`flex gap-3 flex-wrap mt-3 ${
                    isGridView === 'gird' ? ' items-center ' : ''
                } ${isGridView === 'list' ? ' flex-col' : ''}`}>
                {isGridView === 'gird' && children}
                {isGridView === 'list' && ListViewCard}
            </div>
        </div>
    );
}
