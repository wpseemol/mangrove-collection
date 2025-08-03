"use client";

import ButtonLoading from "@/components/button-loading";
import { Button } from "@/components/ui/button";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { addCategoryAction } from "@/lib/actions/category/add-category";
import { addCategorySchema } from "@/lib/schemas/zod/add-category-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast, Toaster } from "sonner";
import type { z } from "zod";
import CategoryContainer from "./category-container";
import CategoryImage from "./category-image";

type FormData = z.infer<typeof addCategorySchema>;

export function AddCategoryForm() {
     const [isFormReset, setIsFormReset] = useState<boolean>(false);
     const [isFileUpload, setIsFileUpload] = useState<boolean>(false);

     /**
      * isFormReset again false
      */
     useEffect(() => {
          if (isFormReset) {
               setTimeout(() => {
                    setIsFormReset(false);
               }, 1000);
          }
     }, [isFormReset]);

     const form = useForm<z.infer<typeof addCategorySchema>>({
          resolver: zodResolver(addCategorySchema),
          defaultValues: {
               name: "",
               slug: "",
               imgUrl: "",
          },
     });

     const name = form.watch("name");

     // Auto-generate slug from name
     useEffect(() => {
          if (name) {
               form.setValue(
                    "slug",
                    name
                         .trim()
                         .toLowerCase()
                         .replace(/[^\w\s-]/g, "-")
                         .replace(/\s+/g, "-")
                         .replace(/^-+|-+$/g, "")
               );
               form.clearErrors("slug");
          } else {
               form.setValue("slug", "");
               form.clearErrors("slug");
          }
     }, [form, name]);

     /**
      * form submit here.
      * @onSubmit
      */

     async function onSubmit(values: z.infer<typeof addCategorySchema>) {
          console.log("Form submitted with values:", values);

          const response = await addCategoryAction(values);

          if (!response.success) {
               toast.error(response.message);
               return;
          }

          if (response.success) {
               toast.success(response.message || "Product added successfully.");
               form.reset();
               setIsFormReset(true);
               return;
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5"
                    >
                         <div className="md:col-span-2">
                              <CategoryContainer
                                   title="Category Details"
                                   id="category-details"
                              >
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
                                                                 className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
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
                                                                 placeholder="product-slug-example"
                                                                 className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                                            />
                                                       </FormControl>
                                                       <FormMessage className="text-red-500 text-sm" />
                                                  </FormItem>
                                             )}
                                        />
                                   </div>
                              </CategoryContainer>

                              <CategoryContainer
                                   title="Category Media"
                                   id="category-media"
                              >
                                   <CategoryImage
                                        form={form}
                                        setIsFileUpload={setIsFileUpload}
                                        isFormReset={isFormReset}
                                   />
                              </CategoryContainer>
                         </div>
                         <section className="md:col-span-3 -mt-4">
                              <Button
                                   disabled={
                                        form.formState.isSubmitting ||
                                        isFileUpload
                                   }
                                   type="submit"
                                   className="text-white disabled:cursor-wait"
                              >
                                   {isFileUpload ? (
                                        "Wait..."
                                   ) : (
                                        <>
                                             Add Category
                                             {form.formState.isSubmitting && (
                                                  <ButtonLoading />
                                             )}
                                        </>
                                   )}
                              </Button>
                         </section>
                    </form>
               </Form>

               <Toaster position="top-center" richColors closeButton />
          </>
     );
}
