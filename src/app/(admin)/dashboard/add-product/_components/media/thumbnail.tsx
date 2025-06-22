"use client";

import {
     FormControl,
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { deleteUploadedImage, thumbnailUpload } from "@/lib/actions/media";
import { AddProductFormType } from "@/types/add-products";
import Image from "next/image";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { FcCheckmark } from "react-icons/fc";
import { FiUpload } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";

export default function Thumbnail({ form }: { form: AddProductFormType }) {
     const [file, setFile] = useState<FileStateType | null>(null);

     const [progress, setProgress] = useState<number>(0);

     const [uploadImage, setUploadImage] = useState<UploadImageType | null>(
          null
     );

     // console.log(progress);

     async function handelImageDeleted() {
          if (!uploadImage) return;
          const response = await deleteUploadedImage({
               public_id: uploadImage?.public_id,
          });
          console.log("deleted response:", response);
          setFile(null);
          form.setValue("thumbnail", "");
     }

     async function handelAcceptFile(acceptedFile) {
          const formData = new FormData();
          formData.append("product-images", acceptedFile);

          setProgress(0);
          const progressInterval = setInterval(() => {
               setProgress((prev) => Math.min(prev + 1, 100));
          }, 1);
          const response = await thumbnailUpload(formData);
          clearInterval(progressInterval);
          setProgress(100);

          if (response.success) {
               setUploadImage({
                    ulr: response.data.secure_url as string,
                    public_id: response.data.public_id as string,
               });

               form.setValue("thumbnail", response.data.secure_url as string);
          }
     }

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
                              size: 1MB
                         </FormDescription>

                         <FormControl>
                              {/* preview when is true */}
                              {file ? (
                                   <div className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex justify-center items-center h-72 ">
                                        <div className="w-[calc(100%-10rem)] border border-gray-200 p-4 bg-white rounded relative">
                                             <div className="flex items-center gap-4">
                                                  <figure className="w-24 min-h-24 ">
                                                       <Image
                                                            src={file.preview}
                                                            onLoad={() => {
                                                                 URL.revokeObjectURL(
                                                                      file.preview
                                                                 );
                                                            }}
                                                            alt="thumbnail"
                                                            width={300}
                                                            height={300}
                                                            className="w-auto h-auto rounded"
                                                       />
                                                  </figure>
                                                  <div className="flex flex-col gap-1">
                                                       <h2 className="">
                                                            {file.file.name}
                                                       </h2>
                                                       <p>
                                                            {(
                                                                 file.file
                                                                      .size /
                                                                 1024
                                                            ).toFixed(2)}{" "}
                                                            KB
                                                       </p>
                                                  </div>
                                             </div>

                                             <Progress
                                                  className="bg-slate-400 h-2 mt-2"
                                                  value={progress}
                                             />

                                             <div className="h-6 w-fit mt-1">
                                                  <FcCheckmark
                                                       className={`${
                                                            progress === 100
                                                                 ? "animate-jump-in"
                                                                 : "hidden"
                                                       } text-2xl `}
                                                  />
                                             </div>
                                             {/* image Cancel button */}
                                             <span
                                                  title={
                                                       progress === 100
                                                            ? ""
                                                            : "You not deleted now"
                                                  }
                                                  onClick={() => {
                                                       if (progress === 100) {
                                                            handelImageDeleted();
                                                       }
                                                  }}
                                                  className={`${
                                                       progress === 100
                                                            ? "cursor-pointer"
                                                            : "cursor-wait"
                                                  } absolute right-4 top-4 text-lg`}
                                             >
                                                  <IoCloseOutline />
                                             </span>
                                             {/* image Cancel button */}
                                        </div>
                                   </div>
                              ) : (
                                   <DragAndDropImage
                                        form={form}
                                        setFile={setFile}
                                        actionAcceptFile={handelAcceptFile}
                                   />
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

function DragAndDropImage({
     form,
     setFile,
     actionAcceptFile,
}: {
     form: AddProductFormType;
     setFile: Dispatch<SetStateAction<FileStateType | null>>;
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
                    setFile({
                         file: acceptedFiles[0],
                         preview: URL.createObjectURL(acceptedFiles[0]),
                    });
                    /**
                     * the when file is accept then call.
                     */
                    actionAcceptFile(acceptedFiles[0]);
               }

               /**
                *  if any file rejection set form message.
                */
               if (fileRejections.length > 0) {
                    const errorMessageObj = {
                         "file-invalid-type":
                              "Only JPEG, JPG, and PNG files are allowed.",
                         "too-many-files": "Only one file can be uploaded.",
                         "file-too-large": "Image file is too larger.",
                    };

                    form.setError("thumbnail", {
                         type: "manual",
                         message:
                              errorMessageObj[
                                   fileRejections[0].errors[0].code
                              ] || "Image file select wrong.",
                    });
               } else {
                    form.clearErrors("thumbnail");
               }
          },
          [form, setFile, actionAcceptFile]
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
                         "border-dashed border-2 border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 rounded-md w-full flex justify-center items-center h-72 cursor-pointer hover:border-primary transition-colors",
               })}
          >
               <input {...getInputProps()} multiple={false} />
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

interface FileStateType {
     file: FileWithPath;
     preview: string;
}

interface UploadImageType {
     ulr: string;
     public_id: string;
}
