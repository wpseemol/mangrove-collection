'use client';
import { FormLabel } from '@/components/ui/form';
import Image from 'next/image';
import { useState } from 'react';
import { FcAddImage, FcUpload } from 'react-icons/fc';
import { imageUrl64bit } from './utility';

export default function Images({ form }) {
    const [imageUpload, setImageUpload] = useState([
        { id: crypto.randomUUID(), imgUrl: null },
    ]);

    function handelAddElement() {
        setImageUpload((pre) => [
            ...pre,
            {
                id: crypto.randomUUID(),
                imgUrl: null,
            },
        ]);
    }

    return (
        <>
            <div className="mb-1">
                <FormLabel>Images</FormLabel>
                <p className="text-xs">
                    Product Images width and height 500x500 preferable
                </p>
            </div>
            <div className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex justify-center items-center min-h-40 h-fit p-2">
                {/* image upload add */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    {imageUpload?.map((element) => (
                        <InputOrImage
                            key={element?.id}
                            element={element}
                            setImageUpload={setImageUpload}
                        />
                    ))}

                    <div
                        onClick={handelAddElement}
                        className={`${uploadImageBtn} cursor-pointer group`}>
                        <FcAddImage className="text-4xl group-hover:scale-110 duration-200" />
                    </div>
                </div>
                {/* image upload add */}
            </div>
        </>
    );
}

let selectedId = '';
// image or input box here
function InputOrImage({ element, setImageUpload }) {
    const handelClick = (id) => {
        selectedId = id;
    };

    function handelImageUpload(event) {
        const file = event.target.files[0];
        imageUrl64bit(selectedId, file, setImageUpload); // image util
    }

    return (
        <div>
            {element?.imgUrl ? (
                <figure className={uploadImageBtn}>
                    <Image
                        src={element?.imgUrl}
                        alt={`image-${element?.id}`}
                        width={100}
                        height={100}
                        className="w-auto h-auto"
                    />
                </figure>
            ) : (
                <div className={uploadImageBtn}>
                    <label
                        onClick={() => handelClick(element.id)}
                        htmlFor="images"
                        className="w-full h-full flex flex-col justify-center items-center hover:scale-105 duration-200 gap-1">
                        <FcUpload className="text-4xl" />
                        <p className="text-sm font-medium">Upload now</p>
                    </label>
                    <input
                        onChange={(e) => handelImageUpload(e)}
                        htmlFor="images"
                        id="images"
                        className="hidden"
                        type="file"
                        accept="image/*"
                    />
                </div>
            )}
        </div>
    );
}

const uploadImageBtn =
    'w-24 h-24 border border-neutral-500/20 flex justify-center items-center rounded overflow-hidden';
