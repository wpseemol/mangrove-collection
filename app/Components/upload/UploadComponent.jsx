'use client';
import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import AddCategory from './AddCategory';
import UploadForm from './UploadForm';

export default function UploadComponent({ allCategory }) {
    const [tabViewValue, setTabViewValue] = useState('addProduct');

    return (
        <>
            <section>
                <div className="mb-4 border-b dark:border-b-slate-50/20">
                    <nav className="flex ml-4 items-center gap-2 border-b-0">
                        <button
                            onClick={() => setTabViewValue('addProduct')}
                            className={`${
                                tabViewValue === 'addProduct'
                                    ? 'border-b-primaryColor border-b-2 -mb-[1px] duration-300'
                                    : ''
                            } px-5 py-3 duration-200`}>
                            Add Product
                        </button>
                        <button
                            onClick={() => setTabViewValue('addCategory')}
                            className={`${
                                tabViewValue === 'addCategory'
                                    ? 'border-b-primaryColor border-b-2 -mb-[1px] duration-300'
                                    : ''
                            } px-5 py-3 duration-200`}>
                            Add Category
                        </button>
                    </nav>
                </div>
                {tabViewValue === 'addProduct' && (
                    <>
                        <h1 className="text-3xl text-center font-semibold mb-6">
                            Product Upload
                        </h1>
                        <UploadForm allCategory={allCategory} />
                    </>
                )}

                {tabViewValue === 'addCategory' && (
                    <>
                        <h1 className="text-3xl text-center font-semibold mb-6">
                            Add Category
                        </h1>
                        <AddCategory />
                    </>
                )}
            </section>

            <Toaster />
        </>
    );
}
