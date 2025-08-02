"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
} from "@/components/ui/form";
import {
     Select,
     SelectContent,
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { getCategory } from "@/lib/actions/category";
import { productContentUpdate } from "@/lib/actions/product";
import {
     productCategorySchema,
     productUnitSchema,
} from "@/lib/schemas/zod/edit-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export default function ProductCategoryForm({
     content,
     productId,
}: {
     content: string;
     productId: string;
}) {
     const [isDisable, setIsDisable] = useState<boolean>(true);

     const [categories, setCategories] = useState<Categories[]>([]);

     const usePathName = usePathname();
     const router = useRouter();

     const form = useForm<z.infer<typeof productCategorySchema>>({
          resolver: zodResolver(productCategorySchema),
          defaultValues: {
               category: content,
          },
     });

     const categoryWatch = form.watch("category");
     useEffect(() => {
          setIsDisable(categoryWatch === content);
     }, [categoryWatch, content]);

     useEffect(() => {
          const fetchData = async () => {
               try {
                    const response = await getCategory();
                    setCategories(response);
               } catch (error) {
                    console.error("Fetch error:", error);
                    setCategories([]);
               }
          };

          fetchData();
     }, []);

     async function onSubmit(values: z.infer<typeof productUnitSchema>) {
          const response = await productContentUpdate(
               productId,
               values,
               "category",
               usePathName
          );
          if (response.success) {
               toast.success(response.message);
          } else {
               toast.error(response.message);
          }
     }

     return (
          <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FormField
                         control={form.control}
                         name="category"
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel className="text-gray-700 font-medium">
                                        Select Category*
                                   </FormLabel>
                                   <Select
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                   >
                                        <FormControl>
                                             <SelectTrigger className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-gray-800 w-full capitalize">
                                                  <SelectValue placeholder="Select category" />
                                             </SelectTrigger>
                                        </FormControl>
                                        <SelectContent className="bg-white border-gray-300 shadow-lg">
                                             {categories.length > 0 &&
                                                  categories.map((category) => (
                                                       <SelectItem
                                                            key={category.id}
                                                            value={category.id}
                                                            className="text-gray-700 hover:bg-gray-100 capitalize border-b border-gray-500/10 hover:border-gray-500/30 last:border-0"
                                                       >
                                                            {category.name.toLocaleLowerCase()}
                                                       </SelectItem>
                                                  ))}
                                        </SelectContent>
                                   </Select>
                                   <div className="mt-1">
                                        <Button
                                             type="button"
                                             variant="ghost"
                                             className="cursor-pointer"
                                             onClick={() => {
                                                  router.push(
                                                       "/dashboard/add-product/add-category"
                                                  );
                                             }}
                                        >
                                             + Add Category
                                        </Button>
                                   </div>
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

/**
 * Represents a category entity.
 *
 * @interface Categories
 * @property {string} id - The unique identifier for the category.
 * @property {string} name - The name of the category.
 * @property {string} slug - The URL-friendly identifier for the category, typically used in web URLs.
 * @property {string} imgUrl - The URL of the image associated with the category.
 */
interface Categories {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
}
