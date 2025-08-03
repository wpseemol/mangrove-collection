"use client";

import ButtonLoading from "@/components/button-loading";
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
import { Input } from "@/components/ui/input";
import { categoryUpdate } from "@/lib/actions/category/add-category";
import { addCategorySchema } from "@/lib/schemas/zod/add-category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import type { z } from "zod";
import CategoryEditImageInput from "./category-edit-image-input";

type FormData = z.infer<typeof addCategorySchema>;

export function CategoryUpdateForm({
     content,
     categoryId,
}: {
     content: string;
     categoryId: string;
}) {
     const [isFileUpload, setIsFileUpload] = useState<boolean>(false);

     const [isDisabled, setIsDisabled] = useState<boolean>(false);

     const formDefaultValue = JSON.parse(content) as FormData;

     const pathName = usePathname();

     const form = useForm<z.infer<typeof addCategorySchema>>({
          resolver: zodResolver(addCategorySchema),
          defaultValues: {
               ...formDefaultValue,
          },
     });

     const changeInputFromContent = form.watch();
     useEffect(() => {
          setIsDisabled(content === JSON.stringify(changeInputFromContent));
     }, [content, changeInputFromContent, setIsDisabled]);

     /**
      * form submit here.
      * @onSubmit
      */

     async function onSubmit(values: z.infer<typeof addCategorySchema>) {
          const response = await categoryUpdate(categoryId, values, pathName);

          if (!response.success) {
               toast.error(response.message);
               return;
          }

          if (response.success) {
               toast.success(
                    response.message || "Category update successfully."
               );

               return;
          }
     }

     return (
          <>
               <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="">
                         {/* category name */}
                         <div className="mb-3">
                              <FormField
                                   control={form.control}
                                   name="name"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel className="text-gray-700 font-medium">
                                                  Category Name*
                                             </FormLabel>
                                             <FormControl>
                                                  <Input
                                                       {...field}
                                                       placeholder="Enter product name"
                                                       className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white placeholder:text-gray-400 text-gray-800"
                                                  />
                                             </FormControl>
                                             <FormMessage className="text-red-500 text-sm" />
                                        </FormItem>
                                   )}
                              />
                         </div>

                         {/* category slug */}
                         <div className="mb-3">
                              <FormField
                                   control={form.control}
                                   name="slug"
                                   render={({ field }) => (
                                        <FormItem>
                                             <FormLabel className="text-gray-700 font-medium">
                                                  Category Slug*
                                             </FormLabel>
                                             <FormControl>
                                                  <Input
                                                       {...field}
                                                       placeholder="category-slug-example"
                                                       className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 bg-white placeholder:text-gray-400 text-gray-800"
                                                  />
                                             </FormControl>
                                             <FormMessage className="text-red-500 text-sm" />
                                        </FormItem>
                                   )}
                              />
                         </div>

                         <CategoryEditImageInput
                              form={form}
                              setIsFileUpload={setIsFileUpload}
                         />

                         <section className=" mt-4">
                              <DialogFooter className="mt-2">
                                   <DialogClose asChild>
                                        <Button variant="outline">
                                             Cancel
                                        </Button>
                                   </DialogClose>

                                   <Button
                                        disabled={
                                             form.formState.isSubmitting ||
                                             isFileUpload ||
                                             isDisabled
                                        }
                                        type="submit"
                                        className={`text-white ${
                                             form.formState.isSubmitting ||
                                             isFileUpload
                                                  ? "cursor-wait"
                                                  : ""
                                        } ${
                                             isDisabled
                                                  ? "cursor-not-allowed"
                                                  : ""
                                        } pointer-events-auto disabled:pointer-events-auto`}
                                   >
                                        {isFileUpload ? (
                                             "Wait..."
                                        ) : (
                                             <>
                                                  Add Category
                                                  {isDisabled
                                                       ? ""
                                                       : form.formState
                                                              .isSubmitting && (
                                                              <ButtonLoading />
                                                         )}
                                             </>
                                        )}
                                   </Button>
                              </DialogFooter>
                         </section>
                    </form>
               </Form>

               <Toaster position="top-center" richColors closeButton />
          </>
     );
}
