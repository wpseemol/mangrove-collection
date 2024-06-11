'use client';

import createCategoryAction from '@/app/actions/createCategoryAction/createCategoryAction';
import imageDeleteAction from '@/app/actions/imageDeleteAction/imageDeleteAction';
import imageUploadAction from '@/app/actions/imageUploadAction/ImageUploadAction';
import { useAuth } from '@/app/hooks';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';

export default function AddCategory() {
    const [categoryImageUrl, setCategoryImageUrl] = useState('');
    const [categorySlug, setCategorySlug] = useState('');
    const categoryImageRef = useRef(null);
    const router = useRouter();
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
        const file = event.target.files[0];
        const formData = new FormData();
        formData.append('imageFile', file);
        const imgUlr = await imageUploadAction(formData, 'category-image');
        setCategoryImageUrl(imgUlr);
    }

    async function handelDeleteImage() {
        const path = new URL(categoryImageUrl).pathname;
        // Remove query parameters (if any)
        const pathWithoutQuery = path.split('?')[0];
        // Split by percent-encoded slash to get the file name
        const fileName = decodeURIComponent(pathWithoutQuery)
            .split('%2F')
            .pop();
        const fileArray = fileName.split('/');
        const imageName = fileArray[fileArray.length - 1];

        const isDeleted = await imageDeleteAction('category', imageName);
        if ('deleted' === isDeleted) {
            setCategoryImageUrl('');
            categoryImageRef.current.value = '';
            router.refresh();
        }
    }

    return (
        <form
            onSubmit={handelAddCategory}
            className="bg-white dark:bg-slate-700 shadow-md rounded sm:px-8 px-3 pt-6 pb-8 mb-4 sm:w-2/5  mx-auto">
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
                    htmlFor="categorySlug">
                    Slug
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
                    Category Image
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

                {categoryImageUrl && (
                    <div className="mt-4 ">
                        <figure className="relative w-fit h-fit group">
                            <span
                                onClick={handelDeleteImage}
                                className="absolute right-1 -top-1 text-xl text-red-600 group-hover:opacity-100 group-hover:scale-100 scale-0 opacity-0 duration-150 cursor-pointer">
                                &#215;
                            </span>
                            <Image
                                src={categoryImageUrl}
                                width={100}
                                height={100}
                                alt="category image"
                                className="w-auto h-auto"
                            />
                        </figure>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between">
                <button
                    title={!categoryImageUrl ? 'please input filed' : ''}
                    disabled={!categoryImageUrl}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none disabled:cursor-not-allowed disabled:bg-blue-300"
                    type="submit">
                    Upload Category
                </button>
            </div>
        </form>
    );
}
