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
import { useCallback, useEffect, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { FcMultipleInputs } from "react-icons/fc";
import PreviewImagesComponents from "./preview-Images-components";

export default function Images({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const [preViewImages, setPreviewImages] = useState<
          PreviewStateType[] | null
     >(null);

     useEffect(() => {
          if (preViewImages && preViewImages.length > 0) {
               const imagesValue = preViewImages.map((item) => ({
                    id: item.id,
                    imgUrl: item?.url || "",
               }));
               if (imagesValue.length > 0) {
                    form.setValue("images", imagesValue);
                    form.clearErrors("images");
               }
          }
     }, [preViewImages, form]);

     /**
      * form rest
      */
     useEffect(() => {
          if (isFormReset) setPreviewImages(null);
     }, [isFormReset]);

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
                                   <div className=" flex flex-col justify-center items-center min-h-40 h-fit">
                                        {preViewImages && (
                                             <div className="flex items-center flex-wrap gap-1.5 my-3">
                                                  {preViewImages.map(
                                                       (previewImg) => (
                                                            <PreviewImagesComponents
                                                                 key={
                                                                      previewImg.id
                                                                 }
                                                                 previewImageDetails={
                                                                      previewImg
                                                                 }
                                                                 setPreviewImages={
                                                                      setPreviewImages
                                                                 }
                                                            />
                                                       )
                                                  )}
                                             </div>
                                        )}

                                        <DrugAndDrop
                                             setPreviewImages={setPreviewImages}
                                             form={form}
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

     form,
}: DrugAndDropType) {
     const onDrop = useCallback(
          (acceptedFiles: FileWithPath[], fileRejections: FileRejection[]) => {
               if (acceptedFiles.length > 0) {
                    const previewArray = acceptedFiles.map((file) => ({
                         id: generateUniqueIds(),
                         file: file,
                         fileName: file.name,
                         preview: URL.createObjectURL(file),
                    }));

                    setPreviewImages((prev) =>
                         prev ? [...prev, ...previewArray] : previewArray
                    );
                    form.clearErrors("images");
               }

               if (fileRejections.length > 0) {
                    const errorMessages = {
                         "file-invalid-type":
                              "Only JPEG, JPG, and PNG files are allowed.",
                         "too-many-files": "Only one file can be uploaded.",
                         "file-too-large": `Image file is too large (max 1MB).`,
                    };
                    form.setError("images", {
                         type: "manual",
                         message:
                              errorMessages[fileRejections[0].errors[0].code] ||
                              "Image file select wrong.",
                    });
               }
          },
          [form, setPreviewImages]
     );

     const { getRootProps, getInputProps, isDragActive } = useDropzone({
          onDrop,
          accept: { "image/*": [".jpeg", ".jpg", ".png"] },
          maxSize: 1024 * 1000,
     });

     return (
          <div
               {...getRootProps()}
               className=" flex justify-center items-center h-fit cursor-pointer py-3 mt-1 border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full group hover:border-neutral-500/90"
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
};

export interface PreviewStateType {
     id: string;
     file: FileWithPath | null;
     fileName: string;
     preview: string;
     url?: string | null;
     public_id?: string | null;
}
