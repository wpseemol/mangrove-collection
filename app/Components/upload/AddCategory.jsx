'use client';

import { useState } from 'react';

export default function AddCategory() {
    const [categorySlug, setCategorySlug] = useState('');

    function handelCategoryName(event) {
        const categoryNameValue = event.target.value;
        const slagValue = categoryNameValue.toLowerCase().replace(/\s+/g, '-');
        setCategorySlug(slagValue);
    }

    return (
        <form className="bg-white dark:bg-slate-700 shadow-md rounded sm:px-8 px-3 pt-6 pb-8 mb-4 sm:w-2/5  mx-auto">
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="categoryName">
                    Category Name
                </label>
                <input
                    onChange={handelCategoryName}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="categoryName"
                    type="text"
                    name="categoryName"
                    placeholder="Category Name"
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="categorySlag">
                    Slag
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="categorySlag"
                    type="text"
                    name="categorySlag"
                    placeholder="Slag"
                    defaultValue={categorySlug}
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="categoryImage">
                    Category Image
                </label>
                <input
                    //onChange={(event) => handelFileUpload(event, 'thumbnail')}
                    className="shadow appearance-none border dark:bg-slate-700 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="categoryImage"
                    type="file"
                    accept="image/*"
                    required
                />
            </div>

            <div className="flex items-center justify-between">
                <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none"
                    type="submit">
                    Upload Category
                </button>
            </div>
        </form>
    );
}
