"use client";

import {
     FormControl,
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { AddProductFormType } from "@/types/add-products";
import Image from "next/image";
import { useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { FiTrash2, FiUpload } from "react-icons/fi";

export default function Thumbnail({ form }: { form: AddProductFormType }) {
     //  const onDrop = useCallback((acceptedFiles: File[]) => {
     //       if (acceptedFiles.length === 1) {
     //            // Create preview
     //            const reader = new FileReader();
     //            reader.onload = () => {
     //                 setPreview(reader.result as string);
     //            };
     //            reader.readAsDataURL(acceptedFiles[0]);
     //       }
     //  }, []);

     const {
          acceptedFiles,
          getRootProps,
          fileRejections,
          getInputProps,
          isDragActive,
     } = useDropzone({
          accept: { "image/*": [".jpeg", ".jpg", ".png"] },
          maxFiles: 1,
          //   onDrop,
     });

     function handelRemoveFile() {
          //   setPreview(null);
     }

     console.log("accept files:", acceptedFiles);

     useEffect(() => {
          // Handle file rejections
          if (fileRejections.length > 0) {
               const errors = fileRejections[0].errors;
               if (errors.some((e) => e.code === "file-invalid-type")) {
                    form.setError("thumbnail", {
                         type: "manual",
                         message: "Only JPEG, JPG, and PNG files are allowed",
                    });
               } else if (errors.some((e) => e.code === "too-many-files")) {
                    form.setError("thumbnail", {
                         type: "manual",
                         message: "Only one file can be uploaded",
                    });
               }
          }
     }, [fileRejections, form]);

     return (
          <FormField
               control={form.control}
               name="thumbnail"
               render={({ fieldState }) => (
                    <FormItem>
                         <FormLabel className="-mb-2">
                              Thumbnail image*
                         </FormLabel>
                         <FormDescription>
                              Image width and height 300x300 preferable. Max
                              size: 5MB
                         </FormDescription>

                         <FormControl>
                              {acceptedFiles[0] ? (
                                   <div className="relative group">
                                        <div className="border border-neutral-200 rounded-md overflow-hidden w-fit mx-auto">
                                             <figure className="w-52 relative">
                                                  <Image
                                                       src={URL.createObjectURL(
                                                            acceptedFiles[0]
                                                       )}
                                                       alt="Preview"
                                                       width={100}
                                                       height={100}
                                                       className="w-auto h-auto object-cover"
                                                  />
                                                  <button
                                                       type="button"
                                                       onClick={
                                                            handelRemoveFile
                                                       }
                                                       className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                                  >
                                                       <FiTrash2 className="w-4 h-4" />
                                                  </button>
                                             </figure>
                                        </div>

                                        <div className="mt-2 text-sm text-gray-500">
                                             {acceptedFiles[0].name} (
                                             {(
                                                  acceptedFiles[0].size / 1024
                                             ).toFixed(2)}{" "}
                                             KB)
                                        </div>
                                   </div>
                              ) : (
                                   <div
                                        {...getRootProps({
                                             className:
                                                  "border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-md w-full flex justify-center items-center h-72 cursor-pointer hover:border-primary transition-colors",
                                        })}
                                   >
                                        <input
                                             {...getInputProps()}
                                             multiple={false}
                                        />
                                        <div className="text-center p-4">
                                             {isDragActive ? (
                                                  <>
                                                       <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                                       <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                            Drop the file here
                                                       </p>
                                                  </>
                                             ) : (
                                                  <>
                                                       <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-3" />
                                                       <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                                                            Drag and drop your
                                                            thumbnail here
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
                                                            JPEG, JPG, PNG up to
                                                            5MB
                                                       </p>
                                                  </>
                                             )}
                                        </div>
                                   </div>
                              )}
                         </FormControl>
                         <FormMessage className="text-red-500">
                              {fieldState.error?.message}
                         </FormMessage>
                    </FormItem>
               )}
          />
     );
}
