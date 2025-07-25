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
import {
     deleteUploadedImage,
     imagesUploadCloudinary,
} from "@/lib/actions/media";
import { AddProductFormType } from "@/types/add-products";
import Image from "next/image";
import {
     Dispatch,
     SetStateAction,
     useCallback,
     useEffect,
     useState,
} from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { FcCheckmark } from "react-icons/fc";
import { FiUpload } from "react-icons/fi";
import { IoCloseOutline } from "react-icons/io5";

export default function Thumbnail({
     form,
     isFormReset,
     setIsFileUpload,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
     setIsFileUpload: Dispatch<SetStateAction<boolean>>;
}) {
     const [file, setFile] = useState<FileStateType | null>(null);

     const [progress, setProgress] = useState<number>(0);
     const [loading, setLoading] = useState<boolean>(false);

     const [uploadImage, setUploadImage] = useState<UploadImageType | null>(
          null
     );

     // console.log(progress);

     async function handelImageDeleted() {
          setIsFileUpload(true);
          if (!uploadImage) return;
          setLoading(true);
          await deleteUploadedImage({
               public_id: uploadImage?.public_id,
          });

          setFile(null);
          form.setValue("thumbnail", "");
          setLoading(false);
          setIsFileUpload(false);
     }

     async function handelAcceptFile(acceptedFile: FileWithPath) {
          setIsFileUpload(true);
          const formData = new FormData();
          formData.append("product-images", acceptedFile);

          setProgress(0);
          const progressInterval = setInterval(() => {
               setProgress((prev) => Math.min(prev + 1, 100));
          }, 30);
          const response = await imagesUploadCloudinary(formData);
          clearInterval(progressInterval);
          setProgress(100);

          if (
               response.success &&
               response.data?.secure_url &&
               response.data?.public_id
          ) {
               setUploadImage({
                    ulr: response.data.secure_url,
                    public_id: response.data.public_id,
               });

               form.setValue("thumbnail", response.data.secure_url);
          }
          setIsFileUpload(false);
     }

     useEffect(() => {
          if (isFormReset) setFile(null);
     }, [isFormReset]);

     return (
          <FormField
               control={form.control}
               name="thumbnail"
               render={() => (
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
                                   <div className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex justify-center items-center h-72 group overflow-hidden">
                                        <div
                                             className={`xl:w-[calc(100%-10rem)] border border-gray-200 p-4 bg-white rounded relative `}
                                        >
                                             <div className="flex xl:flex-row flex-col items-center gap-4 ">
                                                  <figure className="w-24 h-24 rounded-lg overflow-hidden shadow-md border border-neutral-200 transition-shadow duration-200 group-hover:shadow-lg group-hover:border-primary-400">
                                                       <Image
                                                            src={
                                                                 file.preview ||
                                                                 "/assets/logo/no-image.jpg"
                                                            }
                                                            onLoad={() => {
                                                                 URL.revokeObjectURL(
                                                                      file.preview
                                                                 );
                                                            }}
                                                            alt={file.file.name}
                                                            width={80}
                                                            height={80}
                                                            className="object-cover w-full h-full transition-transform duration-200"
                                                       />
                                                  </figure>
                                                  <div className="flex flex-col gap-1">
                                                       <h2 className="break-words whitespace-normal 2xl:max-w-[21rem] xl:max-w-[18rem] max-w-[15rem]">
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
                                                  role="button"
                                                  tabIndex={0}
                                                  aria-label="Remove thumbnail image"
                                                  onKeyDown={(e) => {
                                                       if (
                                                            !loading &&
                                                            progress === 100 &&
                                                            e.key === "Delete"
                                                       ) {
                                                            e.preventDefault();
                                                            handelImageDeleted();
                                                       }
                                                  }}
                                                  title={
                                                       progress === 100
                                                            ? ""
                                                            : "You not deleted now"
                                                  }
                                                  onClick={() => {
                                                       if (
                                                            !loading &&
                                                            progress === 100
                                                       ) {
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
                                                            <span className="text-sm text-gray-600 mt-1">
                                                                 Deleting...
                                                            </span>
                                                       </div>
                                                  </div>
                                             )}
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
                         <FormMessage className="text-red-500 text-sm" />
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
