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
import { productContentUpdate } from "@/lib/actions/product";
import { productThumbnailSchema } from "@/lib/schemas/zod/edit-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export default function ProductThumbnailForm({
     content,
     productId,
     productName,
}: {
     content: string;
     productId: string;
     productName: string;
}) {
     const [isDisable, setIsDisable] = useState<boolean>(true);

     const usePathName = usePathname();

     const form = useForm<z.infer<typeof productThumbnailSchema>>({
          resolver: zodResolver(productThumbnailSchema),
          defaultValues: {
               thumbnail: content,
          },
     });

     const inputThumbnailValue = form.watch("thumbnail");
     useEffect(() => {
          setIsDisable(inputThumbnailValue === content);
     }, [inputThumbnailValue, content]);

     async function onSubmit(values: z.infer<typeof productThumbnailSchema>) {
          const response = await productContentUpdate(
               productId,
               values,
               "thumbnail",
               usePathName
          );

          if (response.success) {
               toast.success(response.message);
          } else {
               toast.error(response.message);
          }
     }

     async function handleThumbnailRemove() {
          console.log("deleted thumbnail:", content);
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
                                        {inputThumbnailValue ? (
                                             <PreviewThumbnailImage
                                                  productName={productName}
                                                  previewImageUlr={
                                                       inputThumbnailValue
                                                  }
                                                  actionRemove={
                                                       handleThumbnailRemove
                                                  }
                                             />
                                        ) : (
                                             "thumbnail input images"
                                        )}
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
                              disabled={
                                   isDisable || form.formState.isSubmitting
                              }
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

function PreviewThumbnailImage({
     previewImageUlr,
     productName,
     actionRemove,
}: {
     previewImageUlr: string;
     productName: string;
     actionRemove: () => Promise<void> | void;
}) {
     return (
          <figure className="relative w-fit mx-auto">
               <Image
                    src={previewImageUlr}
                    alt={productName}
                    width={100}
                    height={100}
                    className="w-auto h-auto object-center rounded"
               />
               <button
                    onClick={actionRemove}
                    type="button"
                    role="button"
                    aria-label="Remove thumbnail image"
                    className="absolute right-0 top-0 text-white bg-red-500 hover:bg-red-600 rounded duration-150"
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
          </figure>
     );
}
