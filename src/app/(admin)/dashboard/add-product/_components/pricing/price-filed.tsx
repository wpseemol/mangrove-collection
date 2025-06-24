"use client";
import { CurrencyIcon } from "@/components/currency-icon";
import {
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { AddProductFormType } from "@/types/add-products";
import { useEffect, useState } from "react";

export default function PriceFiled({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const variantsValues = form.watch("variants");

     return (
          <FormField
               control={form.control}
               name="price"
               render={() => (
                    <FormItem>
                         <FormLabel className="">Price variants</FormLabel>
                         <FormDescription>
                              Set the price for each product variant. You can
                              add multiple prices for different options.
                         </FormDescription>
                         {variantsValues.length > 0 &&
                              variantsValues.map((variant) => (
                                   <PriceInput
                                        key={variant.id}
                                        variant={variant}
                                        form={form}
                                        isFormReset={isFormReset}
                                   />
                              ))}

                         {/* price err message here */}
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

function PriceInput({
     variant,
     form,
     isFormReset,
}: {
     variant: PriceVariantType;
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const [price, setPrice] = useState<string>(""); // use string to allow empty value
     const currency = form.watch("currency");

     function handleChangeInputPrice(
          event: React.ChangeEvent<HTMLInputElement>
     ) {
          const inputValue = event.target.value;
          // Check if input is a valid number and not empty
          const isValid = inputValue !== "" && !isNaN(Number(inputValue));
          setPrice(inputValue);

          // Optionally, convert to number or set to null if invalid
          const numericValue = isValid ? Number(inputValue) : null;
          // You can use isValid and numericValue as needed
     }

     useEffect(() => {
          if (isFormReset) {
               setPrice("");
          }
     }, [isFormReset]);

     return (
          <div className="flex items-center gap-4 py-2 border-b border-gray-200 last:border-b-0">
               <div className="w-1/3 flex items-center">
                    <span className="font-medium text-gray-700 capitalize">
                         {variant.title.toLocaleLowerCase()}
                    </span>
               </div>
               <div className="w-2/3 flex items-center gap-2">
                    <span className="text-gray-500">:</span>
                    <Input
                         onChange={handleChangeInputPrice}
                         value={price}
                         placeholder="Enter price"
                         className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                         type="number"
                         min={1}
                         step="0.01"
                    />
                    <span className="text-gray-400 text-sm">
                         <CurrencyIcon currency={currency} />
                    </span>
               </div>
          </div>
     );
}

interface PriceVariantType {
     type: string;
     id: string;
     title: string;
}
