import {
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";

import { AddProductFormType } from "@/types/add-products";
import PriceFormControl from "./price-form-control";
import PriceUnitSelect from "./price-unit-select";

export default function Pricing({ form }: { form: AddProductFormType }) {
     return (
          <>
               <div className="mb-4">
                    <PriceUnitSelect form={form} />
               </div>
               <div className="mb-4">
                    <FormField
                         control={form.control}
                         name="price"
                         render={({ fieldState }) => (
                              <FormItem>
                                   <FormLabel className="mb-1">
                                        Price variants
                                   </FormLabel>
                                   <FormDescription>
                                        You can add different variant price.
                                   </FormDescription>
                                   <PriceFormControl form={form} />
                                   {/* price err message here */}
                                   <FormMessage className="text-red-500">
                                        {fieldState.error?.message}
                                   </FormMessage>
                              </FormItem>
                         )}
                    />
               </div>
          </>
     );
}
