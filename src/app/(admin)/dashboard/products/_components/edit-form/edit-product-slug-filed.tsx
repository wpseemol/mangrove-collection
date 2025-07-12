"use client";
import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditProductFormType } from "./edit-product-form";

export default function EditProductSlugFiled({
     form,
}: {
     form: EditProductFormType;
}) {
     return (
          <FormField
               control={form.control}
               name="slug"
               render={({ field }) => (
                    <FormItem className="min-w-2/3">
                         <FormLabel className="data-[error=true]:text-gray-600 font-medium dark:text-gray-200">
                              Slug*
                         </FormLabel>
                         <FormControl>
                              <Input
                                   {...field}
                                   placeholder="Enter product name"
                                   className="border-transparent bg-white dark:bg-gray-900 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-600 dark:text-gray-200"
                              />
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}
