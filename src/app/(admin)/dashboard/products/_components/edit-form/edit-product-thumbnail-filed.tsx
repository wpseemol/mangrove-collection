"use client";
import {
     FormControl,
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { FiUpload } from "react-icons/fi";
import { EditProductFormType } from "./edit-product-form";

export default function EditProductThumbnailFiled({
     form,
}: {
     form: EditProductFormType;
}) {
     const [previewUrl, setPreviewUrl] = useState<string | null>(
          form.getValues("thumbnail")
     );

     async function handelRemoveImage() {
          setPreviewUrl(null);
     }

     async function handleAcceptFile(file: FileWithPath) {
          console.log("here image:", file);
     }

     return (
          <FormField
               control={form.control}
               name="thumbnail"
               render={() => (
                    <FormItem className="md:col-span-3">
                         <FormLabel className="data-[error=true]:text-gray-600 font-medium dark:text-gray-200">
                              Thumbnail image*
                         </FormLabel>
                         <FormDescription>
                              Image width and height 300x300 preferable. Max
                              size: 1MB
                         </FormDescription>
                         <FormControl>
                              <div className="flex flex-col items-center w-full border border-dashed border-gray-400 rounded">
                                   {previewUrl ? (
                                        <PreviewImages
                                             url={previewUrl}
                                             productName={form.getValues(
                                                  "name"
                                             )}
                                             actionRemove={handelRemoveImage}
                                        />
                                   ) : (
                                        <AddProductImageInput
                                             form={form}
                                             setPreviewUrl={setPreviewUrl}
                                             actionAcceptFile={handleAcceptFile}
                                        />
                                   )}
                              </div>
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

function PreviewImages({
     url,
     productName,
     actionRemove,
}: {
     url: string;
     productName: string;
     actionRemove: () => Promise<void> | void;
}) {
     return (
          <figure className="relative">
               <Image src={url} alt={productName} width={80} height={80} />
               <button
                    type="button"
                    onClick={actionRemove}
                    className="absolute top-0 right-0 bg-white rounded-full p-1 shadow hover:bg-gray-100"
                    aria-label="Remove image"
               >
                    <svg
                         xmlns="http://www.w3.org/2000/svg"
                         className="h-4 w-4 text-gray-600"
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
          </figure>
     );
}

function AddProductImageInput({
     form,
     setPreviewUrl,
     actionAcceptFile,
}: {
     form: EditProductFormType;
     setPreviewUrl: Dispatch<SetStateAction<string | null>>;
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
                    /**
                     * the when file is accept then call.
                     */

                    const render = new FileReader();
                    render.onload = (e) => {
                         setPreviewUrl(e.target?.result);
                    };
                    render.readAsDataURL(acceptedFiles[0]);

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

                    form.setError("thumbnail", {
                         type: "manual",
                         message: getErrorMessage(
                              fileRejections[0].errors[0].code
                         ),
                    });
               } else {
                    form.clearErrors("thumbnail");
               }
          },
          [form, setPreviewUrl, actionAcceptFile]
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
                    className: "",
               })}
          >
               <input {...getInputProps()} multiple={false} />
               <div className="text-center p-4">
                    {isDragActive ? (
                         <>
                              <FiUpload className="mx-auto h-4 w-4 text-gray-400 mb-3" />
                              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                   Drop the file here
                              </p>
                         </>
                    ) : (
                         <>
                              <FiUpload className="mx-auto h-4 w-4 text-gray-400 mb-3" />
                              <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
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
