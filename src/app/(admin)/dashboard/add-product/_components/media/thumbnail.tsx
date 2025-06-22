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
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const [file, setFile] = useState<FileStateType | null>(null);

     const [progress, setProgress] = useState<number>(0);
     const [loading, setLoading] = useState<boolean>(false);

     const [uploadImage, setUploadImage] = useState<UploadImageType | null>(
          null
     );

     // console.log(progress);

     async function handelImageDeleted() {
          if (!uploadImage) return;
          setLoading(true);
          await deleteUploadedImage({
               public_id: uploadImage?.public_id,
          });

          setFile(null);
          form.setValue("thumbnail", "");
          setLoading(false);
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

     useEffect(() => {
          if (isFormReset) setFile(null);
     }, [isFormReset]);

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
                                        <div
                                             className={`w-[calc(100%-10rem)] border border-gray-200 p-4 bg-white rounded relative `}
                                        >
                                             <div className="flex items-center gap-4 ">
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
                                                                 aria-hidden="true"
                                                                 class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-green-600"
                                                                 viewBox="0 0 100 101"
                                                                 fill="none"
                                                                 xmlns="http://www.w3.org/2000/svg"
                                                            >
                                                                 <path
                                                                      d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                                      fill="currentColor"
                                                                 />
                                                                 <path
                                                                      d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                                      fill="currentFill"
                                                                 />
                                                            </svg>
                                                            <span className="text-sm text-gray-600 mt-1">
                                                                 Deleting...
                                                            </span>
                                                       </div>
                                                  </div>
                                             )}
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
