'use client';

import imageUploadAction from '@/app/actions/imageUploadAction/ImageUploadAction';
import { useState } from 'react';
import { IoReload } from 'react-icons/io5';

export default function AddProduct({ allCategory }) {
    const [thumbnailImage, setThumbnailImage] = useState('');
    const [imageArr, setImageArr] = useState([]);
    const [productSlug, setProductSlug] = useState('');
    const [loading, setLoading] = useState(false);

    async function uploadFileAction(event) {
        event.preventDefault();
        const productData = new FormData(event.target);
        productData.forEach((value, key) => {
            console.log(key, value);
        });
    }

    async function handelFileUpload(event, where) {
        setLoading(true);
        const fileData = new FormData();

        if ('thumbnail' === where) {
            fileData.append('imageFile', event.target.files[0]);
            const uploadImage = await imageUploadAction(fileData, 'thumbnail');
            if (!!uploadImage) {
                setThumbnailImage(uploadImage);
                setLoading(false);
            } else {
                setLoading(false);
            }
        } else if ('images' === where) {
            const files = event.target.files;
            for (let i = 0; i < files.length; i++) {
                fileData.append('imageFile', files[i]);
            }
            const uploadImage = await imageUploadAction(fileData);
        }

        // console.log(uploadImage);
    }

    function handelProductName(event) {
        const productNameValue = event.target.value;
        const slagValue = productNameValue.toLowerCase().replace(/\s+/g, '-');
        setProductSlug(slagValue);
    }

    return (
        <form
            onSubmit={uploadFileAction}
            className="bg-white dark:bg-slate-700 shadow-md rounded sm:px-8 px-3 pt-6 pb-8 mb-4 sm:w-2/5  mx-auto">
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productName">
                    Product Name
                </label>
                <input
                    onChange={handelProductName}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="productName"
                    type="text"
                    name="productName"
                    placeholder="Product Name"
                    required
                />
            </div>

            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="category">
                    Category
                </label>
                <select
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-800 leading-tight focus:outline-none focus:shadow-outline cursor-pointer"
                    id="category"
                    name="category"
                    required>
                    {allCategory?.map((category) => (
                        <option
                            key={category?.id}
                            value={category?.categorySlug}
                            className="border">
                            {category?.categoryName}
                        </option>
                    ))}
                </select>
            </div>

            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productSlug">
                    Slug
                </label>
                <input
                    className="shadow appearance-none dark:bg-slate-700 border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="productSlug"
                    defaultValue={productSlug}
                    name="slug"
                    type="text"
                    placeholder="Slug"
                    required
                />
            </div>
            <div className="mb-4 flex items-center gap-2 ">
                <div className="w-2/3">
                    <label
                        className="block text-gray-700 dark:text-neutral-200  text-sm font-bold mb-2"
                        htmlFor="productPrice">
                        Price
                    </label>
                    <input
                        className="shadow appearance-none border dark:bg-slate-700 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                        id="productPrice"
                        name="price"
                        type="number"
                        placeholder="Price"
                        required
                    />
                </div>

                {/*----------------------------*/}

                <div className="w-1/3">
                    <label
                        className="block text-gray-700 dark:text-neutral-200  text-sm font-bold mb-2"
                        htmlFor="currency">
                        Currency:
                    </label>
                    <select
                        className="shadow appearance-none border dark:bg-slate-800 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline text-center cursor-pointer"
                        id="currency"
                        defaultValue="taka"
                        name="currency">
                        <option value="taka">&#2547;</option>
                        <option value="dollar">$</option>
                    </select>
                </div>
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="shortDescription">
                    Short Description
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="shortDescription"
                    name="shortDescription"
                    rows="4"
                    placeholder="Short Description"></textarea>
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productThumbnail">
                    Thumbnail
                </label>
                <input
                    onChange={(event) => handelFileUpload(event, 'thumbnail')}
                    className="shadow appearance-none border dark:bg-slate-700 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="productThumbnail"
                    type="file"
                    accept="image/*"
                    required
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productDescription">
                    Description
                </label>
                <textarea
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 dark:bg-slate-700 leading-tight focus:outline-none focus:shadow-outline"
                    id="productDescription"
                    name="description"
                    rows="8"
                    placeholder="Product Description"
                    required></textarea>
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productImages">
                    Images
                </label>
                <input
                    onChange={(event) => handelFileUpload(event, 'images')}
                    className="shadow dark:bg-slate-700 appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                />
            </div>
            <div className="flex items-center justify-between">
                <button
                    disabled={loading}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:cursor-not-allowed flex items-center gap-2"
                    type="submit">
                    Upload Product{' '}
                    {loading && <IoReload className="animate-spin text-xl" />}
                </button>
            </div>
        </form>
    );
}