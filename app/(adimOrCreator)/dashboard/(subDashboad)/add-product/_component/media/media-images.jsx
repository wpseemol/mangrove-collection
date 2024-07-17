'use client';
import { FormLabel } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/firebase/firebase-config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FcAddImage, FcMultipleInputs, FcUpload } from 'react-icons/fc';
import { convertFileToBase64, imageUrlBase64 } from './utility';
import dragAndDrop from '/public/assets/logo/drag and drop icon.png';

let initialUpdatedImageValue = [
    {
        id: crypto.randomUUID(),
        file: null,
        imgUrl: null,
    },
];
export default function Images({ form }) {
    const [imageUpload, setImageUpload] = useState(initialUpdatedImageValue);
    const [dragDorpImages, setDragDropImages] = useState([]);

    function handelAddElement() {
        setImageUpload((pre) => [
            ...pre,
            {
                id: crypto.randomUUID(),
                imgUrl: null,
            },
        ]);

        form.clearErrors('images');
    }

    return (
        <>
            <div className="mb-1">
                <FormLabel>Images</FormLabel>
                <p className="text-xs">
                    Product Images width and height 500x500 preferable
                </p>
            </div>
            <div
                className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex 
            flex-col justify-center items-center min-h-40 h-fit p-2 py-4">
                {/* image upload add */}
                <div className="flex items-center justify-center gap-4 flex-wrap">
                    {imageUpload?.map((element) => (
                        <InputOrImage
                            key={element?.id}
                            element={element}
                            setImageUpload={setImageUpload}
                            form={form}
                        />
                    ))}

                    <div
                        onClick={handelAddElement}
                        className={`${uploadImageBtn} cursor-pointer group`}>
                        <FcAddImage className="text-4xl group-hover:scale-110 duration-200" />
                    </div>
                </div>
                {/* image upload add */}

                <DrugAndDrop
                    setDragDropImages={setDragDropImages}
                    setImageUpload={setImageUpload}
                    form={form}
                />
            </div>
        </>
    );
}

let selectedId = '';
// image or input box here
function InputOrImage({ element, setImageUpload, form }) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [firebaseUrls, setFirebaseUrls] = useState([]);

    const handelClick = (id) => {
        selectedId = id;
    };

    function handelImageUpload(event) {
        const file = event.target.files[0];
        imageUrlBase64(selectedId, file, setImageUpload); // image util
        form.clearErrors('images');
    }

    useEffect(() => {
        async function firebaseImageUpload(uploadImage, uploadImageId) {
            try {
                const imageRef = ref(storage, `/product/${uploadImage?.name}`);
                const uploadTask = uploadBytesResumable(imageRef, uploadImage);
                uploadTask.on(
                    'state_changed',
                    (snapshot) => {
                        const progress =
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                            100;

                        setUploadProgress(progress);
                    },
                    (error) => {
                        form.setError('images', {
                            type: 'manual',
                            message: 'Error uploading image. Please try again.',
                        });
                    },
                    async () => {
                        const firebaseUrl = await getDownloadURL(
                            ref(storage, imageRef)
                        );
                        setFirebaseUrls((pre) => [
                            ...pre,
                            { id: uploadImageId, firebaseUrl },
                        ]);
                    }
                );
            } catch (error) {
                throw error;
            }
        }

        if (element?.imgUrl) {
            firebaseImageUpload(element?.file, element?.id);
        }
    }, [element, form]);

    return (
        <>
            {element?.imgUrl ? (
                <figure className={uploadImageBtn}>
                    <Image
                        src={element?.imgUrl}
                        alt={`image-${element?.id}`}
                        width={100}
                        height={100}
                        className="w-auto h-auto"
                    />
                    {uploadProgress !== 100 && (
                        <>
                            <div
                                className="absolute top-0 left-0 w-full h-full flex justify-center items-center
                            backdrop-blur-[1px] bg-green-900/35 text-neutral-100 z-10 cursor-wait">
                                <p className="text-lg font-medium">
                                    {uploadProgress}
                                </p>
                            </div>
                            <Progress
                                className="bg-slate-400 h-[6px] absolute -bottom-2 left-0 shadow-lg z-10"
                                value={uploadProgress}
                            />
                        </>
                    )}
                </figure>
            ) : (
                <div className={`${uploadImageBtn} overflow-hidden`}>
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
        </>
    );
}

const uploadImageBtn =
    'w-24 h-24 border border-neutral-500/20 flex flex-col justify-center items-center rounded relative';

function DrugAndDrop({ setDragDropImages, setImageUpload, form }) {
    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
                setDragDropImages(acceptedFiles);

                async function base64Urls() {
                    try {
                        const response = await Promise.all(
                            acceptedFiles?.map((element) =>
                                convertFileToBase64(element)
                            )
                        );
                        setImageUpload((pre) => {
                            const filterArray = pre.filter(
                                (item) => item.imgUrl
                            );
                            return [...filterArray, ...response];
                        });
                    } catch (error) {
                        throw error;
                    }
                }

                base64Urls();
            }

            form.clearErrors('images');
        },
        [setDragDropImages, setImageUpload, form]
    );

    const {
        acceptedFiles,
        getRootProps,
        fileRejections,
        getInputProps,
        isDragActive,
    } = useDropzone({ onDrop, accept: { 'image/jpeg': [], 'image/png': [] } });

    return (
        <>
            <div
                {...getRootProps({
                    className: 'w-full flex justify-center items-center h-fit',
                })}>
                <input {...getInputProps()} multiple={false} />
                {isDragActive ? (
                    <div className="h-[8.2rem] flex flex-col justify-center items-center">
                        <div className="text-center text-7xl my-2 mx-auto">
                            <FcMultipleInputs className="scale-125 text-center mx-auto" />
                        </div>
                        <p className="text-center  text-lg font-medium">
                            Drop the files here ...
                        </p>
                    </div>
                ) : (
                    <div className="py-1 h-[8.2rem] ">
                        <figure className="w-20 mx-auto">
                            <Image src={dragAndDrop} alt="drag and drop" />
                        </figure>
                        <p className="text-center ">or</p>
                        <p className="text-center text-lg font-medium">
                            Drag and drop your file here
                        </p>
                    </div>
                )}
            </div>
        </>
    );
}
