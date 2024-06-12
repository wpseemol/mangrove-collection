'use client';

import addProductAction from '@/app/actions/addProductAction/addProductAction';
import imageUploadAction from '@/app/actions/imageUploadAction/ImageUploadAction';
import { useAuth } from '@/app/hooks';
import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { IoReload } from 'react-icons/io5';
import ImagesShow from './ImagesShow';

export default function AddProduct({ allCategory }) {
    const [thumbnailImage, setThumbnailImage] = useState('');
    const [imageArr, setImageArr] = useState([]);
    const [productSlug, setProductSlug] = useState('');
    const [loading, setLoading] = useState(false);

    const thumbnailImageRef = useRef(null);
    const imagesRef = useRef(null);

    const [auth] = useAuth();

    async function uploadFileAction(event) {
        event.preventDefault();
        setLoading(true);
        let productObj = {
            thumbnail: thumbnailImage,
            images: imageArr,
            user: auth?.id,
            offer: 0,
            popularity: 0,
        };
        const productData = new FormData(event.target);
        productData.forEach((value, key) => {
            productObj[key] = value;
        });

        const afterAdd = await addProductAction(productObj);
        if ('created' === afterAdd) {
            toast.success('Successfully product created');
            setThumbnailImage('');
            setImageArr([]);
            setProductSlug('');
            event.target.reset();
            setLoading(false);
        } else if ('slug-massed' === afterAdd) {
            toast.error('Product Slug must be Unique!');
            setLoading(false);
        } else {
            toast.error('Something is wrong please check');
            setThumbnailImage('');
            setImageArr([]);
            setProductSlug('');
            event.target.reset();
            setLoading(false);
        }
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
            const uploadImage = await imageUploadAction(fileData, 'images');
            if (!!uploadImage) {
                setImageArr(uploadImage);
                setLoading(false);
            } else {
                setLoading(false);
            }
        }
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
                    Product Name*
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
                    Category*
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
                    Slug*
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
                <div className="w-1/5">
                    <label
                        className="block text-gray-700 dark:text-neutral-200  text-sm font-bold mb-2"
                        htmlFor="unit">
                        Unit:
                    </label>
                    <select
                        className="shadow appearance-none border dark:bg-slate-800 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline text-center cursor-pointer"
                        id="unit"
                        defaultValue="kg"
                        name="unit">
                        <option value="kg" className="text-xl">
                            KG
                        </option>
                        <option value="pc" className="text-xl">
                            PC
                        </option>
                    </select>
                </div>

                {/* -------------- */}
                <div className="w-3/5">
                    <label
                        className="block text-gray-700 dark:text-neutral-200  text-sm font-bold mb-2"
                        htmlFor="productPrice">
                        Price*
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

                <div className="w-1/5">
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
                        <option value="taka" className="text-xl">
                            &#2547;
                        </option>
                        <option value="dollar" className="text-xl">
                            &#36;
                        </option>
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
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold"
                    htmlFor="productThumbnail">
                    Thumbnail*
                </label>
                <p>Image width and height 300x300 Preferable</p>
                <input
                    ref={thumbnailImageRef}
                    onChange={(event) => handelFileUpload(event, 'thumbnail')}
                    className="shadow appearance-none border dark:bg-slate-700 rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="productThumbnail"
                    type="file"
                    accept="image/*"
                    required
                />

                {/* preview image */}
                <ImagesShow
                    imageUrl={thumbnailImage}
                    setImageUrl={setThumbnailImage}
                    imageRef={thumbnailImageRef}
                    basketPathName="product"
                    type="single"
                />
            </div>
            <div className="mb-4">
                <label
                    className="block text-gray-700 dark:text-neutral-200 text-sm font-bold mb-2"
                    htmlFor="productDescription">
                    Description*
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
                    ref={imagesRef}
                    onChange={(event) => handelFileUpload(event, 'images')}
                    className="shadow dark:bg-slate-700 appearance-none border rounded w-full py-2 px-3 text-gray-700 dark:text-neutral-200 leading-tight focus:outline-none focus:shadow-outline"
                    id="productImages"
                    type="file"
                    accept="image/*"
                    multiple
                />

                <ImagesShow
                    imageUrl={imageArr}
                    setImageUrl={setImageArr}
                    imageRef={imagesRef}
                    basketPathName="product"
                    type="multi"
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
