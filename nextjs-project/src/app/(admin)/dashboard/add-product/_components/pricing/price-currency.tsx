"use client";
import {
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
import { PRICE_CURRENCY } from "@/lib/constant";
import { AddProductFormType } from "@/types/add-products";

export default function PriceCurrency({ form }: { form: AddProductFormType }) {
     return (
          <FormField
               control={form.control}
               name="currency"
               render={({ field }) => (
                    <FormItem>
                         <FormLabel id="price-currency" className="mb-1">
                              Currency*
                         </FormLabel>

                         <Select
                              onValueChange={field.onChange}
                              value={field.value}
                         >
                              <SelectTrigger className="border-gray-200 w-full">
                                   <SelectValue placeholder="Select Variant Type" />
                              </SelectTrigger>
                              <SelectContent className="bg-gray-50 border-gray-100">
                                   <SelectGroup>
                                        <SelectLabel>
                                             Select Currency
                                        </SelectLabel>

                                        {PRICE_CURRENCY.map((currency) => (
                                             <SelectItem
                                                  key={currency.id}
                                                  value={currency.id}
                                             >
                                                  <span
                                                       dangerouslySetInnerHTML={{
                                                            __html: currency.title,
                                                       }}
                                                  />
                                             </SelectItem>
                                        ))}
                                   </SelectGroup>
                              </SelectContent>
                         </Select>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}
