'use client';

import imageDeleteAction from '@/action/image-delete-action';
import {
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Progress } from '@/components/ui/progress';
import { storage } from '@/firebase/firebase-config';
import { AddCategoryFormType } from '@/types/add-category';
import bytesToMegabytes from '@/utils/bytes-to-megabytes';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FcCheckmark } from 'react-icons/fc';
import { IoCloseOutline } from 'react-icons/io5';
import dragAndDrop from '/public/assets/logo/drag and drop icon.svg';

export default function CategoryImage({ form }: { form: AddCategoryFormType }) {
    const [previewImage, setPreviewImage] = useState<PreviewImageType>(null);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [imageName, setImageName] = useState<string | null>(null);

    const onDrop = useCallback(
        (acceptedFiles: File[]) => {
            async function imgUrlUpload(files: File[]) {
                try {
                    const uploadImage = files[0];

                    const uploadImageName =
                        crypto.randomUUID() + '-' + uploadImage?.name;
                    setImageName(uploadImageName);

                    const imageRef = ref(
                        storage,
                        `/category/${uploadImageName}`
                    );

                    const uploadTask = uploadBytesResumable(
                        imageRef,
                        uploadImage
                    );

                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress =
                                (snapshot.bytesTransferred /
                                    snapshot.totalBytes) *
                                100;

                            setUploadProgress(progress);
                        },

                        (error) => {
                            form.setError('imgUrl', {
                                type: 'manual',
                                message:
                                    'Error uploading image. Please try again.',
                            });
                        },
                        async () => {
                            const imgUrl = await getDownloadURL(imageRef);

                            form.setValue('imgUrl', imgUrl);
                        }
                    );
                } catch (error) {
                    throw error;
                }
            }
            // image upload unction

            if (acceptedFiles?.length === 1) {
                const file = acceptedFiles[0];
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onloadend = () => {
                    setPreviewImage(reader.result);
                };

                imgUrlUpload(acceptedFiles); // upload Image call
            }

            form.clearErrors('imgUrl');
        },
        [form, setPreviewImage]
    );

    const {
        acceptedFiles,
        getRootProps,
        fileRejections,
        getInputProps,
        isDragActive,
    } = useDropzone({
        onDrop,
        accept: { 'image/jpeg': [], 'image/png': [] },
        maxFiles: 1,
    });

    useEffect(() => {
        if (fileRejections[0]?.errors[0]?.code === 'file-invalid-type') {
            form.setError('imgUrl', {
                type: 'manual',
                message: `You selected ${fileRejections[0]?.file.type}. A image can category image.`,
            });
        } else if (fileRejections[0]?.errors[0]?.code === 'too-many-files') {
            form.setError('imgUrl', {
                type: 'manual',
                message: `You selected ${fileRejections?.length} files. A single image file can category image.`,
            });
        }
        // image upload unction
    }, [form, acceptedFiles]);

    // when form rest state also reset
    useEffect(() => {
        // Listen for reset event from the form
        const subscription = form.watch((value, { name }) => {
            if (name === undefined) {
                setPreviewImage(null);
                setUploadProgress(0);
            }
        });

        return () => subscription.unsubscribe();
    }, [form]);
    // when form rest state also reset

    async function handelImageDeleted() {
        if (imageName) {
            const pathName = 'category';

            try {
                await imageDeleteAction(pathName, imageName);
                setPreviewImage(null);
                setUploadProgress(0);
                setImageName(null);
                form.setValue('imgUrl', '');
            } catch (error) {
                throw error;
            }
        }
    }

    return (
        <>
            <FormField
                control={form.control}
                name="imgUrl"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="-mb-2">Category image*</FormLabel>
                        <FormDescription>
                            Image width and height 300x300 preferable.
                        </FormDescription>

                        <FormControl>
                            <>
                                {previewImage ? (
                                    <div className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex justify-center items-center h-72">
                                        <div className="w-[calc(100%-10rem)] border p-4 bg-white rounded relative">
                                            <div className="flex items-center gap-4">
                                                <figure className="w-24 min-h-24 ">
                                                    <Image
                                                        src={
                                                            previewImage as string
                                                        }
                                                        alt="imgUrl"
                                                        width={300}
                                                        height={300}
                                                        className="w-auto h-auto rounded"
                                                    />
                                                </figure>
                                                <div className="flex flex-col gap-1">
                                                    <h2 className="">
                                                        {imageName}
                                                    </h2>
                                                    <p>
                                                        {bytesToMegabytes(
                                                            acceptedFiles[0]
                                                                ?.size
                                                        )}{' '}
                                                        MB
                                                    </p>
                                                </div>
                                            </div>

                                            <Progress
                                                className="bg-slate-400 h-2 mt-2"
                                                value={uploadProgress}
                                            />

                                            <div className="h-6 w-fit mt-1">
                                                <FcCheckmark
                                                    className={`${
                                                        uploadProgress === 100
                                                            ? 'animate-jump-in'
                                                            : 'hidden'
                                                    } text-2xl `}
                                                />
                                            </div>
                                            {/* image Cancel button */}
                                            <span
                                                title={
                                                    uploadProgress === 100
                                                        ? ''
                                                        : 'You not deleted now'
                                                }
                                                onClick={() => {
                                                    if (
                                                        uploadProgress === 100
                                                    ) {
                                                        handelImageDeleted();
                                                    }
                                                }}
                                                className={`${
                                                    uploadProgress === 100
                                                        ? 'cursor-pointer'
                                                        : 'cursor-wait'
                                                } absolute right-4 top-4 text-lg`}>
                                                <IoCloseOutline />
                                            </span>
                                            {/* image Cancel button */}
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        {...getRootProps({
                                            className:
                                                'border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex justify-center items-center h-72',
                                        })}>
                                        <input
                                            {...getInputProps()}
                                            multiple={false}
                                        />
                                        {isDragActive ? (
                                            <div>
                                                <figure className="w-24 mx-auto">
                                                    <Image
                                                        src={dragAndDrop}
                                                        alt="drag and drop"
                                                    />
                                                </figure>
                                                <p className="text-center text-lg font-medium">
                                                    Drop the files here ...
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="py-4">
                                                <figure className="w-24 mx-auto">
                                                    <Image
                                                        src={dragAndDrop}
                                                        alt="drag and drop"
                                                    />
                                                </figure>
                                                <p className="text-center text-lg font-medium">
                                                    Drag and drop your file here
                                                </p>

                                                <p className="text-center mb-2">
                                                    or
                                                </p>

                                                <span className="font-normal border border-neutral-500/20 mx-auto block w-fit hover:shadow duration-100 px-3 py-2 rounded hover:border-neutral-600/25 cursor-pointer">
                                                    Browse file
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                                {/* image upload progress bar */}
                            </>
                        </FormControl>
                        <FormMessage>{fieldState.error?.message}</FormMessage>
                    </FormItem>
                )}
            />
        </>
    );
}

type PreviewImageType = string | ArrayBuffer | null;
