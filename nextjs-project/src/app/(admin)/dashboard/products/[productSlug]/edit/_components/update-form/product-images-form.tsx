"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { productImagesSchema } from "@/lib/schemas/zod/edit-product-schema";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { FileRejection, FileWithPath, useDropzone } from "react-dropzone";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export default function ProductImagesForm({
     content,
     productId,
     productName,
}: {
     content: string;
     productId: string;
     productName: string;
}) {
     const contentImages = JSON.parse(content) as ProductImageType[];

     const [previewImages, setPreviewImages] = useState<
          ProductImageType[] | null
     >(contentImages);
     const [loading, setLoading] = useState<LoadingType>(null);

     const pathName = usePathname();

     const form = useForm<z.infer<typeof productImagesSchema>>({
          resolver: zodResolver(productImagesSchema),
          defaultValues: {
               images: contentImages,
          },
     });

     const inputImageValue = form.watch("images");

     async function onSubmit() {
          toast.success("Product image auto update.");
     }

     async function handelInputImages(accFile: FileWithPath[]) {
          console.log("accept files:", accFile);
     }

     return (
          <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                         control={form.control}
                         name="thumbnail"
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel className="text-gray-700 font-medium">
                                        Thumbnail Image*
                                   </FormLabel>
                                   <FormControl>
                                        <section>
                                             <div className="flex items-center justify-center gap-1">
                                                  {previewImages &&
                                                       previewImages.length >
                                                            0 &&
                                                       previewImages.map(
                                                            (prvImage, inx) => (
                                                                 <PreviewImage
                                                                      key={
                                                                           prvImage.id
                                                                      }
                                                                      loading={
                                                                           loading
                                                                      }
                                                                      productName={
                                                                           productName +
                                                                           (inx +
                                                                                1)
                                                                      }
                                                                      prvImage={
                                                                           prvImage
                                                                      }
                                                                      form={
                                                                           form
                                                                      }
                                                                      actionPreview={
                                                                           setPreviewImages
                                                                      }
                                                                 />
                                                            )
                                                       )}
                                             </div>
                                             <InputImages
                                                  actionPreview={
                                                       setPreviewImages
                                                  }
                                                  form={form}
                                                  actionAcceptFile={
                                                       handelInputImages
                                                  }
                                             />
                                        </section>
                                   </FormControl>
                                   <FormMessage className="text-red-500 text-sm" />
                              </FormItem>
                         )}
                    />
                    <DialogFooter className="mt-2">
                         <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                         </DialogClose>
                         <Button
                              title="Image auto update."
                              disabled={form.formState.isSubmitting}
                              type="submit"
                              className="text-white disabled:cursor-not-allowed disabled:pointer-events-auto cursor-pointer"
                         >
                              {form.formState.isSubmitting
                                   ? "Saving..."
                                   : "Save changes"}
                         </Button>
                    </DialogFooter>
               </form>
          </Form>
     );
}

function PreviewImage({
     actionPreview,
     productName,
     prvImage,
     loading,
     form,
}: {
     actionPreview: Dispatch<SetStateAction<ProductImageType[] | null>>;
     productName: string;
     prvImage: ProductImageType;
     loading: LoadingType;
     form: UseFormReturn<z.infer<typeof productImagesSchema>>;
}) {
     async function handleRemoveImage() {
          console.log("image id:", prvImage.id);

          actionPreview((prev) => {
               if (!prev) return null;
               const removeItem = prev.filter(
                    (item) => item.id !== prvImage.id
               );
               return removeItem.length > 0 ? removeItem : null;
          });
     }

     return (
          <figure className="relative w-[120px] h-[120px] group object-cover object-center border border-gray-600/10">
               <Image
                    src={prvImage.imgUrl}
                    alt={productName}
                    width={200}
                    height={200}
                    className="w-auto h-auto object-cover object-center rounded"
               />
               <button
                    onClick={handleRemoveImage}
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

function InputImages({
     form,
     actionPreview,
     actionAcceptFile,
}: {
     form: UseFormReturn<z.infer<typeof productImagesSchema>>;
     actionPreview: Dispatch<SetStateAction<ProductImageType[] | null>>;
     actionAcceptFile: (file: FileWithPath[]) => Promise<void> | void;
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
               if (acceptedFiles.length > 0) {
                    acceptedFiles.forEach((file) => {
                         const reader = new FileReader();
                         reader.onloadend = function () {
                              const base64String = reader.result;
                              actionPreview((prev) =>
                                   prev
                                        ? [
                                               ...prev,
                                               {
                                                    id: generateUniqueIds({
                                                         pattern: "***",
                                                    }) as string,
                                                    imgUrl: base64String,
                                               },
                                          ]
                                        : [
                                               {
                                                    id: generateUniqueIds({
                                                         pattern: "***",
                                                    }) as string,
                                                    imgUrl: base64String,
                                               },
                                          ]
                              );
                         };
                         reader.readAsDataURL(file);
                    });

                    /**
                     * the when file is accept then call.
                     */
                    actionAcceptFile(acceptedFiles);
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

                    form.setError("images", {
                         type: "manual",
                         message: getErrorMessage(
                              fileRejections[0].errors[0].code
                         ),
                    });
               } else {
                    form.clearErrors("images");
               }
          },
          [form, actionAcceptFile]
     );

     const { getRootProps, getInputProps, isDragActive } = useDropzone({
          accept: { "image/*": [".jpeg", ".jpg", ".png"] },
          maxSize: 1024 * 1000,
          onDrop,
     });

     return (
          <div
               {...getRootProps()}
               className="px-2 flex justify-center items-center h-fit cursor-pointer py-3 mt-1 border-dashed border-2 border-neutral-500/20 bg-neutral-400/10 w-full group hover:border-neutral-500/90"
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

type LoadingType = { message: string; state: boolean } | null;

type ProductImageType = {
     id: string;
     imgUrl: string;
};
