'use client';
import imageDeleteAction from '@/app/actions/imageDeleteAction/imageDeleteAction';
import { FormDescription, FormLabel } from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/firebase/firebase-config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FcAddImage, FcMultipleInputs, FcUpload } from 'react-icons/fc';
import { MdDelete } from 'react-icons/md';
import ErrorMassage from '../error-message';
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
    const [firebaseUrls, setFirebaseUrls] = useState([]);

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

    useEffect(() => {
        if (firebaseUrls.length > 0) {
            form.setValue('images', firebaseUrls);
        }
    }, [firebaseUrls, form]);

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setFirebaseUrls([]);
                setImageUpload(initialUpdatedImageValue);
            }
        });
        return () => subscription.unsubscribe(); // clan up function
    }, [form]);
    // when form rest state also reset

    return (
        <>
            <div className="mb-1">
                <FormLabel>Pictures</FormLabel>
                <FormDescription className="mt-1">
                    Product Images width and height 500x500 preferable
                </FormDescription>
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
                            setFirebaseUrls={setFirebaseUrls}
                        />
                    ))}

                    <div
                        onClick={handelAddElement}
                        className={`${uploadImageBtn} cursor-pointer group`}>
                        <FcAddImage className="text-4xl group-hover:scale-110 duration-200" />
                    </div>
                </div>
                {/* image upload add */}

                <DrugAndDrop setImageUpload={setImageUpload} form={form} />
            </div>
            <ErrorMassage form={form} type="images" />
        </>
    );
}

let selectedId = '';
// image preview or input box here
function InputOrImage({ element, setImageUpload, form, setFirebaseUrls }) {
    const [uploadProgress, setUploadProgress] = useState(0);

    const handelClick = (id) => {
        selectedId = id;
    };

    function handelImageUpload(event) {
        const file = event.target.files[0];
        imageUrlBase64(selectedId, file, setImageUpload); // image util
        form.clearErrors('images');
    }

    async function handelDelete(id, imageName) {
        const pathName = 'product';
        const isDeleted = await imageDeleteAction(pathName, imageName);
        setImageUpload((pre) => pre?.filter((item) => item.id !== id));
        setFirebaseUrls((pre) => pre?.filter((item) => item.id !== id));
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

                        setFirebaseUrls((prevUrls) => {
                            // Check if the URL with the same ID already exists
                            const urlExists = prevUrls.some(
                                (url) => url.id === uploadImageId
                            );
                            if (!urlExists) {
                                return [
                                    ...prevUrls,
                                    { id: uploadImageId, firebaseUrl },
                                ];
                            }
                            return prevUrls;
                        });
                    }
                );
            } catch (error) {
                form.setError('images', {
                    type: 'manual',
                    message: error?.message,
                });
            }
        }

        if (element?.imgUrl && element?.file) {
            firebaseImageUpload(element?.file, element?.id);
        }
    }, [element, form, setFirebaseUrls]);

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
                    {uploadProgress !== 100 ? (
                        <>
                            <div
                                className="absolute top-0 left-0 w-full h-full flex justify-center items-center
                            backdrop-blur-[1px] bg-green-900/35 text-neutral-100 z-10 cursor-wait">
                                <p className="text-lg font-medium">
                                    {Math.round(uploadProgress)}
                                    <span>%</span>
                                </p>
                            </div>
                            <Progress
                                className="bg-slate-400 h-[6px] absolute -bottom-2 left-0 shadow-lg z-10"
                                value={uploadProgress}
                            />
                        </>
                    ) : (
                        <div
                            className="absolute top-0 left-0 w-full h-full flex justify-center items-center hover:backdrop-blur-[1px] hover:bg-green-900/35 text-neutral-100 z-10 duration-200
                        group">
                            <span
                                onClick={() =>
                                    handelDelete(element.id, element.file?.name)
                                }
                                className="group-hover:scale-100 scale-0 duration-200 text-2xl text-red-500 
                            cursor-pointer p-2">
                                <MdDelete />
                            </span>
                        </div>
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

// image preview or input box here

//  image drag and drop function start
function DrugAndDrop({ setImageUpload, form }) {
    const onDrop = useCallback(
        (acceptedFiles) => {
            if (acceptedFiles?.length > 0) {
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
                        form.setError('images', {
                            type: 'manual',
                            message: error?.message,
                        });
                    }
                }

                base64Urls();
            }

            form.clearErrors('images');
        },
        [setImageUpload, form]
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

//  image drag and drop function end
