"use client";

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
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { AddProductFormType } from "@/types/add-products";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface Category {
     id: string;
     name: string;
     slug: string;
     imgUrl: string;
}

interface CategorySelectProps {
     form: AddProductFormType;
     allCategory: string;
}

export default function CategorySelect({
     form,
     allCategory,
}: CategorySelectProps) {
     const router = useRouter();
     const [selectedCategory, setSelectedCategory] = useState("");
     const categories = JSON.parse(allCategory) as Category[];

     const handleCategoryChange = (value: string) => {
          setSelectedCategory(value);
          const selectedValue = categories.find(
               (category) => category.slug === value
          );

          if (selectedValue) {
               form.setValue("category", selectedValue.id);
               form.clearErrors("category");
          } else {
               form.setError("category", {
                    type: "manual",
                    message: "Invalid category selected",
               });
          }
     };

     const handleAddCategory = () => {
          router.push("/dashboard/add-product/add-category");
     };

     return (
          <div className="space-y-2">
               <FormField
                    control={form.control}
                    name="category"
                    render={({ fieldState }) => (
                         <FormItem>
                              <FormLabel
                                   id="product-category-select"
                                   className="mb-1"
                              >
                                   Category*
                              </FormLabel>
                              <Select
                                   onValueChange={handleCategoryChange}
                                   defaultValue={selectedCategory}
                                   disabled={categories.length === 0}
                              >
                                   <FormControl>
                                        <SelectTrigger
                                             className="bg-transparent border border-neutral-500/20 p-2 
                  focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] w-full capitalize"
                                             aria-labelledby="product-category-select"
                                        >
                                             <SelectValue
                                                  placeholder={
                                                       categories.length
                                                            ? "Select category"
                                                            : "No categories available"
                                                  }
                                             />
                                        </SelectTrigger>
                                   </FormControl>
                                   <SelectContent
                                        className="bg-[#f0f1f7] dark:bg-[#252729] border border-neutral-500/20
                p-2 focus:outline-none focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]"
                                   >
                                        {categories.map((category) => (
                                             <SelectItem
                                                  className="capitalize"
                                                  key={category.id}
                                                  value={category.slug}
                                             >
                                                  {category.name.toLowerCase()}
                                             </SelectItem>
                                        ))}
                                   </SelectContent>
                              </Select>
                              <FormMessage>
                                   {fieldState.error?.message}
                              </FormMessage>
                         </FormItem>
                    )}
               />

               <div className="w-full mt-4">
                    <button
                         type="button"
                         onClick={handleAddCategory}
                         className="w-fit cursor-pointer text-green-600 hover:text-green-700 
          duration-100 font-medium focus:outline-none"
                    >
                         <span className="font-thin">+</span> Add category
                    </button>
               </div>
          </div>
     );
}
