"use client";

import { Button } from "@/components/ui/button";
import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import {
     Select,
     SelectContent,
     SelectGroup,
     SelectItem,
     SelectLabel,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { AddProductFormType } from "@/types/add-products";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface CategorySelectProps {
     form: AddProductFormType;
     allCategory: string;
}

export default function CategorySelect({
     form,
     allCategory,
}: CategorySelectProps) {
     const categoryList = JSON.parse(allCategory) as CategoryList[];
     const router = useRouter();

     const [selectCategory, setSelectCategory] = useState<string>("");

     function handleSelectChange(value: string) {
          setSelectCategory(value);
          const whichCategorySelect = categoryList.find(
               (category) => category.slug === value
          );
          if (whichCategorySelect) {
               form.setValue("category", whichCategorySelect.id);
               form.clearErrors("category");
          }
     }

     return (
          <FormField
               control={form.control}
               name="category"
               render={() => (
                    <FormItem>
                         <FormLabel className="text-gray-700 font-medium">
                              Category*
                         </FormLabel>
                         <FormControl>
                              <section>
                                   <div>
                                        <Select
                                             value={selectCategory}
                                             onValueChange={handleSelectChange}
                                        >
                                             <SelectTrigger className="border-gray-200 w-full capitalize">
                                                  <SelectValue placeholder="Select Category" />
                                             </SelectTrigger>
                                             <SelectContent className="bg-gray-50 border-gray-100">
                                                  <SelectGroup>
                                                       <SelectLabel>
                                                            Select Category
                                                       </SelectLabel>

                                                       {categoryList.length >
                                                            0 &&
                                                            categoryList.map(
                                                                 (category) => (
                                                                      <SelectItem
                                                                           key={
                                                                                category.id
                                                                           }
                                                                           value={
                                                                                category.slug
                                                                           }
                                                                           className="capitalize"
                                                                      >
                                                                           {category.name.toLocaleLowerCase()}
                                                                      </SelectItem>
                                                                 )
                                                            )}
                                                  </SelectGroup>
                                             </SelectContent>
                                        </Select>
                                   </div>
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
                                             + Add Variant
                                        </Button>
                                   </div>
                              </section>
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

interface CategoryList {
     id: string;
     name: string;
     slug: string;
}
