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

export default function ProductName({ form }: { form: AddProductFormType }) {
     return (
          <FormField
               control={form.control}
               name="name"
               render={({ field }) => (
                    <FormItem>
                         <FormLabel className="text-gray-700 font-medium">
                              Product Name*
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
     );
}
