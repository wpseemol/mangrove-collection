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
import { PRODUCT_UNITS } from "@/lib/constant";
import { EditProductFormType } from "./edit-product-form";

export default function EditProductUnitFiled({
     form,
}: {
     form: EditProductFormType;
}) {
     return (
          <FormField
               control={form.control}
               name="unit"
               render={({ field }) => (
                    <FormItem className="min-w-1/3 sm:pl-2 pl-1">
                         <FormLabel className="data-[error=true]:text-gray-600 font-medium dark:text-gray-200">
                              Unit
                         </FormLabel>

                         <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                         >
                              <FormControl>
                                   <SelectTrigger className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 text-gray-800 w-full">
                                        <SelectValue placeholder="Select unit" />
                                   </SelectTrigger>
                              </FormControl>
                              <SelectContent className="bg-white border-gray-300 shadow-lg">
                                   {PRODUCT_UNITS.map((unit) => (
                                        <SelectItem
                                             key={unit.id}
                                             value={unit.id}
                                             className="text-gray-700 hover:bg-gray-100"
                                        >
                                             {unit.title}
                                        </SelectItem>
                                   ))}
                              </SelectContent>
                         </Select>

                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}
