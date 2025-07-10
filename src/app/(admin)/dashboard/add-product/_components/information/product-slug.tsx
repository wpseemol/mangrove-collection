"use client";

import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddProductFormType } from "@/types/add-products";
import { useEffect } from "react";

export default function ProductSlug({ form }: { form: AddProductFormType }) {
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

     return (
          <FormField
               control={form.control}
               name="slug"
               render={({ field }) => (
                    <FormItem>
                         <FormLabel className="text-gray-700 font-medium">
                              Product Slug*
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
     );
}
