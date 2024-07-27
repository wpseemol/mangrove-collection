'use client';
import imageDeleteAction from '@/app/actions/imageDeleteAction/imageDeleteAction';
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
import bytesToMegabytes from '@/utils/bytesToMegabytes';
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage';
import Image from 'next/image';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { FcCheckmark } from 'react-icons/fc';
import { IoCloseOutline } from 'react-icons/io5';
import dragAndDrop from '/public/assets/logo/drag and drop icon.svg';

export default function Thumbnail({ form }) {
    const [previewImage, setPreviewImage] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);

    const onDrop = useCallback(
        (acceptedFiles) => {
            async function thumbnailUpload(files) {
                try {
                    const uploadImage = files[0];
                    const imageRef = ref(
                        storage,
                        `/product/${uploadImage?.name}`
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
                            form.setError('thumbnail', {
                                type: 'manual',
                                message:
                                    'Error uploading image. Please try again.',
                            });
                        },
                        async () => {
                            const imgUrl = await getDownloadURL(
                                ref(storage, imageRef)
                            );
                            form.setValue('thumbnail', imgUrl);
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

                thumbnailUpload(acceptedFiles); // upload Image call
            }

            form.clearErrors('thumbnail');
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

    const fileRejectionItems = fileRejections?.length;

    useEffect(() => {
        if (fileRejectionItems > 0) {
            form.setError('thumbnail', {
                type: 'manual',
                message: `You selected ${fileRejectionItems} images. A single image can thumbnail.`,
            });
        }
        // image upload unction
    }, [form, fileRejectionItems, acceptedFiles]);

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
        const imageName = acceptedFiles[0]?.name;
        const pathName = 'product';
        await imageDeleteAction(pathName, imageName);

        setPreviewImage(null);
        setUploadProgress(0);
        form.setValue('thumbnail', '');
    }

    return (
        <>
            <FormField
                control={form.control}
                name="thumbnail"
                render={({ field, fieldState }) => (
                    <FormItem>
                        <FormLabel className="-mb-2">
                            Thumbnail image*
                        </FormLabel>
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
                                                        src={previewImage}
                                                        alt="thumbnail"
                                                        width={300}
                                                        height={300}
                                                        className="w-auto h-auto rounded"
                                                    />
                                                </figure>
                                                <div className="flex flex-col gap-1">
                                                    <h2 className="">
                                                        {acceptedFiles[0]?.name}
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
