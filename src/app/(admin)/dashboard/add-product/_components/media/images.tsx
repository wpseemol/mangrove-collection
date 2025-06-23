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
import { generateUniqueIds } from "@/utils/unique-id-generate";

import Image from "next/image";
import { useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { FcMultipleInputs } from "react-icons/fc";

export default function Images({ form }: { form: AddProductFormType }) {
     // eslint-disable-next-line @typescript-eslint/no-unused-vars
     const [imageUpload, setImageUpload] = useState([]);
     const [preViewImages, setPreviewImages] = useState<
          PreviewStateType[] | null
     >(null);

     async function actionAcceptFile(acceptFile) {
          console.log(acceptFile);
     }

     console.log("preViewImages:", preViewImages);

     function handelCancelImage(id) {
          console.log("deleted id:", id);
     }

     return (
          <>
               <FormField
                    control={form.control}
                    name="images"
                    render={() => (
                         <FormItem>
                              <FormLabel>Pictures</FormLabel>
                              <FormDescription className="mt-1">
                                   Product Images width and height 300x300
                                   preferable.
                              </FormDescription>
                              <FormControl>
                                   <div className="border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full flex flex-col justify-center items-center min-h-40 h-fit p-2">
                                        {preViewImages && (
                                             <div className="flex gap-2 mt-3">
                                                  {preViewImages.map(
                                                       (previewImg) => (
                                                            <div
                                                                 key={
                                                                      previewImg.id
                                                                 }
                                                                 className="relative group transition-transform duration-200 hover:scale-105"
                                                            >
                                                                 <figure className="w-24 h-24 rounded-lg overflow-hidden shadow-md border border-neutral-200 transition-shadow duration-200 group-hover:shadow-lg group-hover:border-primary-400">
                                                                      <Image
                                                                           src={
                                                                                previewImg.preview
                                                                           }
                                                                           alt={
                                                                                previewImg
                                                                                     .file
                                                                                     .name
                                                                           }
                                                                           width={
                                                                                100
                                                                           }
                                                                           height={
                                                                                100
                                                                           }
                                                                           className="object-cover w-full h-full transition-transform duration-200 group-hover:scale-110"
                                                                      />
                                                                 </figure>
                                                                 <button
                                                                      type="button"
                                                                      className="absolute top-1 right-1 opacity-80 group-hover:opacity-100 transition-opacity duration-200"
                                                                      onClick={() =>
                                                                           handelCancelImage(
                                                                                previewImg.id
                                                                           )
                                                                      }
                                                                 >
                                                                      <svg
                                                                           xmlns="http://www.w3.org/2000/svg"
                                                                           viewBox="0 0 20 20"
                                                                           fill="currentColor"
                                                                           className="w-5 h-5 text-red-500 bg-white rounded-full p-1 shadow transition-colors duration-200 hover:bg-red-500 hover:text-white"
                                                                      >
                                                                           <path
                                                                                fillRule="evenodd"
                                                                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.53-10.47a.75.75 0 00-1.06-1.06L10 8.94 7.53 6.47a.75.75 0 10-1.06 1.06L8.94 10l-2.47 2.47a.75.75 0 101.06 1.06L10 11.06l2.47 2.47a.75.75 0 101.06-1.06L11.06 10l2.47-2.47z"
                                                                                clipRule="evenodd"
                                                                           />
                                                                      </svg>
                                                                 </button>
                                                            </div>
                                                       )
                                                  )}
                                             </div>
                                        )}

                                        <DrugAndDrop
                                             setPreviewImages={setPreviewImages}
                                             form={form}
                                             actionAcceptFile={actionAcceptFile}
                                        />
                                   </div>
                              </FormControl>
                              <FormMessage className="text-red-500 text-sm" />
                         </FormItem>
                    )}
               />
          </>
     );
}

//  image drag and drop function start
function DrugAndDrop({
     setPreviewImages,
     actionAcceptFile,
     form,
}: DrugAndDropType) {
     const onDrop = useCallback(
          (acceptedFiles: FileWithPath[], fileRejections: FileRejection[]) => {
               if (acceptedFiles.length > 0) {
                    const previewArray = acceptedFiles.map((file) => ({
                         id: generateUniqueIds(),
                         file: file,
                         preview: URL.createObjectURL(file),
                    }));

                    setPreviewImages((prev) => {
                         const prevArray = prev
                              ? [...prev, ...previewArray]
                              : previewArray;

                         actionAcceptFile(prevArray.map((item) => item.file));
                         return prevArray;
                    });
                    form.clearErrors("images");
               }

               if (fileRejections.length > 0) {
                    form.setError("thumbnail", {
                         type: "manual",
                         message:
                              errorMessages[fileRejections[0].errors[0].code] ||
                              "Image file select wrong.",
                    });
               }
          },
          [form, setPreviewImages, actionAcceptFile]
     );

     const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          accept: { "image/*": [".jpeg", ".jpg", ".png"] },
          maxSize: 1024 * 1000,
     });

     return (
          <div
               {...getRootProps()}
               className="w-full flex justify-center items-center h-fit cursor-pointer my-2 mt-1"
          >
               <input {...getInputProps()} />

               {isDragActive ? (
                    <div className="h-[10.2rem] flex flex-col justify-center items-center">
                         <FcMultipleInputs className="text-7xl my-2 mx-auto scale-125" />
                         <p className="text-lg font-medium">
                              Drop the files here...
                         </p>
                    </div>
               ) : (
                    <div className="py-1 h-[10.2rem] text-center">
                         <div className="w-20 mx-auto">
                              <Image
                                   src="/assets/logo/drag and drop icon.png"
                                   alt="Drag and drop"
                                   width={80}
                                   height={80}
                                   priority
                              />
                         </div>
                         <p>or</p>
                         <p className="text-lg font-medium">
                              Drag and drop your file here
                         </p>
                         <p className="text-sm text-gray-500">
                              Supports: JPEG, JPG, PNG (Max 1MB)
                         </p>
                    </div>
               )}
          </div>
     );
}

type DrugAndDropType = {
     setPreviewImages: React.Dispatch<
          React.SetStateAction<PreviewStateType[] | null>
     >;
     form: AddProductFormType;
     actionAcceptFile: (file: FileWithPath[]) => Promise<void> | void;
};

interface PreviewStateType {
     id: string;
     file: FileWithPath;
     preview: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface UploadImageType {
     ulr: string;
     public_id: string;
}

const errorMessages = {
     "file-invalid-type": "Only JPEG, JPG, and PNG files are allowed.",
     "too-many-files": "Only one file can be uploaded.",
     "file-too-large": "Image file is too large (max 1MB).",
};
