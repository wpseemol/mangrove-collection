"use client";
import { addCategorySchema } from "@/lib/schemas/zod/add-category-schema";

import {
     FormControl,
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import {
     deleteUploadedImage,
     imagesUploadCloudinary,
} from "@/lib/actions/media";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { UseFormReturn } from "react-hook-form";
import { FiUpload } from "react-icons/fi";
import z from "zod";

export default function CategoryEditImageInput({
     form,
     setIsFileUpload,
}: {
     form: UseFormReturn<z.infer<typeof addCategorySchema>>;
     setIsFileUpload: Dispatch<SetStateAction<boolean>>;
}) {
     const [previewImage, setPreviewImages] = useState<string | null>(
          form.getValues("imgUrl") || null
     );
     const [loading, setLoading] = useState<LoadingType>(null);

     async function handleThumbnailRemove() {
          setIsFileUpload(true);
          setLoading({ state: true, message: "Cancel..." });
          await deleteUploadedImage({
               url: form.getValues("imgUrl"),
          });

          form.setValue("imgUrl", "");
          setPreviewImages(null);
          setLoading(null);
          setIsFileUpload(false);
     }

     async function handleThumbnailInputChange(acceptedFile: FileWithPath) {
          setIsFileUpload(true);
          setLoading({ state: true, message: "Uploading..." });
          const formData = new FormData();
          formData.append("image", acceptedFile);

          const response = await imagesUploadCloudinary(
               formData,
               "category-images"
          );

          if (
               response.success &&
               response.data?.secure_url &&
               response.data?.public_id
          ) {
               form.setValue("imgUrl", response.data.secure_url);
          } else {
               form.setValue("imgUrl", "");
               setPreviewImages(null);
          }

          setLoading(null);
          setIsFileUpload(false);
     }

     return (
          <FormField
               control={form.control}
               name="imgUrl"
               render={() => (
                    <FormItem>
                         <FormLabel className="-mb-2">
                              Category Image*
                         </FormLabel>
                         <FormDescription>
                              Image width and height 100x100 preferable. Max
                              size: 1MB
                         </FormDescription>

                         <FormControl>
                              {previewImage ? (
                                   <PreviewThumbnailImage
                                        categoryName={form.getValues("name")}
                                        previewImageUlr={previewImage}
                                        actionRemove={handleThumbnailRemove}
                                        loading={loading}
                                   />
                              ) : (
                                   <InputThumbnailImage
                                        form={form}
                                        actionPreview={setPreviewImages}
                                        actionAcceptFile={
                                             handleThumbnailInputChange
                                        }
                                   />
                              )}
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

function PreviewThumbnailImage({
     previewImageUlr,
     categoryName,
     actionRemove,
     loading,
}: {
     previewImageUlr: string;
     categoryName: string;
     actionRemove: () => Promise<void> | void;
     loading: LoadingType;
}) {
     return (
          <figure className="relative w-[200px] h-[200px] mx-auto group object-cover object-center border border-gray-600/10">
               <Image
                    src={previewImageUlr}
                    alt={categoryName}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover object-center rounded"
               />
               <button
                    onClick={actionRemove}
                    type="button"
                    role="button"
                    aria-label="Remove thumbnail image"
                    className="absolute right-0 top-0 text-white bg-red-500 hover:bg-red-600 rounded duration-150 scale-0 group-hover:scale-100 opacity-0 group-hover:opacity-100"
               >
                    <svg
                         xmlns="http://www.w3.org/2000/svg"
                         className="h-5 w-5"
                         fill="none"
                         viewBox="0 0 24 24"
                         stroke="currentColor"
                         strokeWidth={2}
                    >
                         <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M6 18L18 6M6 6l12 12"
                         />
                    </svg>
               </button>
               {loading && (
                    <div className="absolute top-0 left-0 w-full h-full backdrop-blur-sm">
                         <div className="flex flex-col items-center justify-center h-full w-full">
                              <svg
                                   className="animate-spin h-6 w-6 text-gray-500"
                                   xmlns="http://www.w3.org/2000/svg"
                                   fill="none"
                                   viewBox="0 0 24 24"
                              >
                                   <circle
                                        className="opacity-25"
                                        cx="12"
                                        cy="12"
                                        r="10"
                                        stroke="currentColor"
                                        strokeWidth="4"
                                   />
                                   <path
                                        className="opacity-75"
                                        fill="currentColor"
                                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                   />
                              </svg>
                              {loading.state && <p>{loading?.message}</p>}
                         </div>
                    </div>
               )}
          </figure>
     );
}

function InputThumbnailImage({
     form,
     actionPreview,
     actionAcceptFile,
}: {
     form: UseFormReturn<z.infer<typeof addCategorySchema>>;
     actionPreview: Dispatch<SetStateAction<string | null>>;
     actionAcceptFile: (file: FileWithPath) => Promise<void> | void;
}) {
     /**
      * Handles the drop event for file uploads in the thumbnail component.
      *
      * Accepts dropped files and file rejections, sets a preview for the accepted image,
      * and triggers the provided file handler. If any files are rejected, sets an appropriate
      * error message on the form based on the rejection reason. Clears errors if there are no rejections.
      *
      * @param acceptedFiles - Array of accepted files (should contain only one file).
      * @param fileRejections - Array of file rejections with error codes and messages.
      */
     const onDrop = useCallback(
          (acceptedFiles: FileWithPath[], fileRejections: FileRejection[]) => {
               if (acceptedFiles.length === 1) {
                    const reader = new FileReader();

                    reader.onloadend = function () {
                         const base64String = reader.result as string;
                         actionPreview(base64String);
                    };

                    reader.readAsDataURL(acceptedFiles[0]);
                    /**
                     * the when file is accept then call.
                     */
                    actionAcceptFile(acceptedFiles[0]);
               }

               /**
                *  if any file rejection set form message.
                */
               if (fileRejections.length > 0) {
                    // Define the error codes as a type
                    type ErrorCode =
                         | "file-invalid-type"
                         | "too-many-files"
                         | "file-too-large";

                    const errorMessageObj: Record<ErrorCode, string> = {
                         "file-invalid-type":
                              "Only JPEG, JPG, and PNG files are allowed.",
                         "too-many-files": "Only one file can be uploaded.",
                         "file-too-large": "Image file is too larger.",
                    };

                    // Create a safe accessor function
                    const getErrorMessage = (code: string): string => {
                         return (
                              errorMessageObj[code as ErrorCode] ||
                              "Image file select wrong."
                         );
                    };

                    form.setError("imgUrl", {
                         type: "manual",
                         message: getErrorMessage(
                              fileRejections[0].errors[0].code
                         ),
                    });
               } else {
                    form.clearErrors("imgUrl");
               }
          },
          [form, actionAcceptFile, actionPreview]
     );

     const { getRootProps, getInputProps, isDragActive } = useDropzone({
          accept: { "image/*": [".jpeg", ".jpg", ".png"] },
          maxFiles: 1,
          maxSize: 1024 * 1000,
          onDrop,
     });

     return (
          <div
               {...getRootProps({
                    className:
                         "border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-md w-full flex justify-center items-center cursor-pointer hover:border-primary transition-colors w-[200px] h-[200px]",
               })}
          >
               <input {...getInputProps()} multiple={false} />
               <div className="text-center py-2">
                    {isDragActive ? (
                         <>
                              <FiUpload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                   Drop the file here
                              </p>
                         </>
                    ) : (
                         <>
                              <FiUpload className="mx-auto h-10 w-10 text-gray-400 mb-2" />
                              <p className="text-md font-medium text-gray-700 dark:text-gray-300">
                                   Drag and drop your thumbnail here
                              </p>
                              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                   or
                              </p>
                              <button
                                   type="button"
                                   className="mt-2 inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                              >
                                   Select file
                              </button>
                              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                   JPEG, JPG, PNG up to 1MB
                              </p>
                         </>
                    )}
               </div>
          </div>
     );
}

type LoadingType = { message: string; state: boolean } | null;
