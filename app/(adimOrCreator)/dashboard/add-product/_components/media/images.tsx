'use client';
import imageDeleteAction from '@/action/image-delete-action';
import {
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/firebase/firebase-config';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FcAddImage, FcMultipleInputs, FcUpload } from 'react-icons/fc';
import { MdDelete } from 'react-icons/md';

import { AddProductFormType } from '@/types/add-product';
import dragAndDrop from '/public/assets/logo/drag and drop icon.png';

export default function Images({ form }: { form: AddProductFormType }) {
    const [imageUpload, setImageUpload] = useState<ImageUploadType[]>(
        initialUpdatedImageValue
    );
    const [firebaseUrls, setFirebaseUrls] = useState<FirebaseUrlsType[]>([]);

    function handelAddElement() {
        setImageUpload((pre: ImageUploadType[]) => [
            ...pre,
            {
                id: crypto.randomUUID(),
                file: null,
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

// image preview or input box here
let selectedId = '';
function InputOrImage({
    element,
    setImageUpload,
    form,
    setFirebaseUrls,
}: InputOrImageType) {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imageNameWithRandomId, setImageNameWithRandomId] = useState<
        string | null
    >(null);

    const handelClick = (id: string) => {
        selectedId = id;
    };

    function handelImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
        const file = event.target.files?.[0];
        if (file) {
            imageUrlBase64(selectedId, file, setImageUpload); // image util
            form.clearErrors('images');
        }
    }

    async function handelDelete(id: string, imageName: string) {
        const pathName = 'product';
        try {
            await imageDeleteAction(pathName, imageName);
            setImageUpload((pre) => pre?.filter((item) => item.id !== id));
            setFirebaseUrls((pre) => pre?.filter((item) => item.id !== id));
        } catch (error) {
            throw error;
        }
    }

    useEffect(() => {
        async function firebaseImageUpload(
            uploadImage: File,
            uploadImageId: string
        ) {
            try {
                const imageNameWithId =
                    crypto.randomUUID() + '-' + uploadImage?.name;
                setImageNameWithRandomId(imageNameWithId);
                const imageRef = ref(storage, `/product/${imageNameWithId}`);
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
                        const firebaseUrl = await getDownloadURL(ref(imageRef));

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
            } catch (error: any) {
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
                        src={element?.imgUrl as string}
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
                                    imageNameWithRandomId &&
                                    handelDelete(
                                        element.id,
                                        imageNameWithRandomId
                                    )
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

type DrugAndDropType = {
    setImageUpload: React.Dispatch<React.SetStateAction<ImageUploadType[]>>;
    form: AddProductFormType;
};
//  image drag and drop function start
function DrugAndDrop({ setImageUpload, form }: DrugAndDropType) {
    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            if (acceptedFiles?.length > 0) {
                const base64Urls = async () => {
                    try {
                        const response: ImageUploadType[] = await Promise.all(
                            acceptedFiles.map((element: File) =>
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
                            message: (error as Error).message,
                        });
                    }
                };

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

    useEffect(() => {
        if (fileRejections[0]?.errors[0]?.code === 'file-invalid-type') {
            form.setError('images', {
                type: 'manual',
                message: `You selected ${fileRejections[0]?.file.type}.Only images can upload.`,
            });
        }
        // image upload unction
    }, [form, acceptedFiles]);

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
type ErrorMassageType = {
    form: AddProductFormType;
    type: any;
};

function ErrorMassage({ form, type }: ErrorMassageType) {
    return (
        <>
            <FormField
                control={form.control}
                name={type}
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}

const imageUrlBase64 = (
    selectedId: string,
    file: File,
    setStateFun: React.Dispatch<React.SetStateAction<ImageUploadType[]>>
) => {
    const render = new FileReader();
    render.readAsDataURL(file);
    render.onloadend = () => {
        setStateFun((pre) => {
            const updatedImageUpload = pre.map((element) => {
                if (element.id === selectedId) {
                    return {
                        ...element,
                        file,
                        imgUrl: render.result,
                    };
                } else {
                    return element;
                }
            });

            return updatedImageUpload;
        });
    };
};

const convertFileToBase64 = (file: File): Promise<ImageUploadType> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onloadend = () => {
            resolve({
                id: crypto.randomUUID(),
                file,
                imgUrl: reader.result,
            });
        };
        reader.onerror = reject;
    });
};

let initialUpdatedImageValue = [
    {
        id: crypto.randomUUID(),
        file: null,
        imgUrl: null,
    },
];

type ImageUploadType = {
    id: string;
    file: File | null;
    imgUrl: ArrayBuffer | FileReader | string | null;
};

type FirebaseUrlsType = {
    id: string;
    firebaseUrl: string;
};

type InputOrImageType = {
    element: ImageUploadType;
    setImageUpload: React.Dispatch<React.SetStateAction<ImageUploadType[]>>;
    form: AddProductFormType; // Replace 'any' with the correct form type if available
    setFirebaseUrls: React.Dispatch<React.SetStateAction<FirebaseUrlsType[]>>;
};
