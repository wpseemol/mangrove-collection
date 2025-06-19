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
          <>
               <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                         <FormItem>
                              <FormLabel className="mb-1">Unit</FormLabel>
                              <Select
                                   onValueChange={field.onChange}
                                   defaultValue={field.value}
                              >
                                   <FormControl>
                                        <SelectTrigger
                                             className="bg-transparent border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] w-full"
                                        >
                                             <SelectValue
                                                  placeholder={`Product unit ${field.value} selected`}
                                             />
                                        </SelectTrigger>
                                   </FormControl>
                                   <SelectContent
                                        className="bg-[#f0f1f7] dark:bg-[#252729]
                                                border border-neutral-500/20
                                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] space-y-0.5"
                                   >
                                        {PRODUCT_UNITS.map((unit) => (
                                             <SelectItem
                                                  key={unit.id}
                                                  value={unit.id}
                                                  className="border border-neutral-800/10 mb-0.5"
                                             >
                                                  {unit.title}
                                             </SelectItem>
                                        ))}
                                   </SelectContent>
                              </Select>
                         </FormItem>
                    )}
               />
          </>
     );
}
