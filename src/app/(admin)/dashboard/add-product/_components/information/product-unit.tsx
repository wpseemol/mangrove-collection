"use client";

import {
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
import { PRODUCT_UNITS } from "@/lib/constant";
import { AddProductFormType } from "@/types/add-product";

export default function ProductUnit({ form }: { form: AddProductFormType }) {
     return (
          <FormField
               control={form.control}
               name="unit"
               render={({ field }) => (
                    <FormItem>
                         <FormLabel className="text-gray-700 font-medium">
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
                    </FormItem>
               )}
          />
     );
}
