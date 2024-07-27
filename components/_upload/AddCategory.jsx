'use client';

import createCategoryAction from '@/app/actions/createCategoryAction/createCategoryAction';
import imageUploadAction from '@/app/actions/imageUploadAction/ImageUploadAction';
import { useAuth } from '@/app/hooks';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoReload } from 'react-icons/io5';
import ImagesShow from './ImagesShow';

export default function AddCategory() {
    const [categoryImageUrl, setCategoryImageUrl] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const [loading, setLoading] = useState(false);
    const categoryImageRef = useRef(null);
    const [auth] = useAuth();

    // form submit function here.
    async function handelAddCategory(event) {
        event.preventDefault();

        if (categoryImageUrl) {
            const formData = new FormData(event.target);
            formData.append('categoryImage', categoryImageUrl);
            formData.append('createBy', auth?.id);
            // category created action.
            const isCreate = await createCategoryAction(formData);

            console.log(isCreate);

            if ('created' === isCreate) {
                toast.success('Category successfully created');
                event.target.reset();
                setCategoryImageUrl('');
                setCategorySlug('');
            } else if ('slug-massed' === isCreate) {
                toast.error('Slug must be unique');
            } else {
                toast.error('Some thing is wrong');
                event.target.reset();
                setCategoryImageUrl('');
                setCategorySlug('');
            }
        }
    }

    function handelCategoryName(event) {
        const categoryNameValue = event.target.value;
        const slugValue = categoryNameValue.toLowerCase().replace(/\s+/g, '-');
        setCategorySlug(slugValue);
    }

    async function handelCategoryImage(event) {
        setLoading(true);
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('imageFile', file);
        const imgUlr = await imageUploadAction(formData, 'category-image');
        if (!!imgUlr) {
            setCategoryImageUrl(imgUlr);
            setLoading(false);
        } else {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handelAddCategory} className=" w-full  ">
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="categoryName">
                    Category Name*
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
                    htmlFor="categorySlug">
                    Slug*
                </label>
                <input
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="categorySlug"
                    type="text"
                    name="categorySlug"
                    placeholder="Slug"
                    defaultValue={categorySlug}
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="categoryImage">
                    Category Image*
                </label>
                <input
                    ref={categoryImageRef}
                    onChange={handelCategoryImage}
                    className="shadow appearance-none border dark:bg-slate-700 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="categoryImage"
                    type="file"
                    accept="image/*"
                    required
                />
                {/* image preview */}
                <ImagesShow
                    imageUrl={categoryImageUrl}
                    setImageUrl={setCategoryImageUrl}
                    imageRef={categoryImageRef}
                    basketPathName="category"
                    type="single"
                />
            </div>

            <div className="flex items-center justify-between">
                <button
                    title={!categoryImageUrl ? 'please input filed' : ''}
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-300 flex items-center gap-2"
                    type="submit">
                    Upload Category{' '}
                    {loading && <IoReload className="animate-spin text-xl" />}
                </button>
            </div>
        </form>
    );
}
