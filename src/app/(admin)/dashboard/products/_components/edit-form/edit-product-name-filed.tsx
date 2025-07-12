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

export default function EditProductNameFiled({
     form,
}: {
     form: EditProductFormType;
}) {
     return (
          <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                    <FormItem className="md:col-span-3">
                         <FormLabel className="data-[error=true]:text-gray-600 font-medium dark:text-gray-200">
                              Product Name*
                         </FormLabel>
                         <FormControl>
                              <Input
                                   {...field}
                                   placeholder="Enter product name"
                                   className="border-transparent dark:bg-gray-900 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-600 dark:text-gray-200 bg-white"
                              />
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}
