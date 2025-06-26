"use client";
import { CurrencyIcon } from "@/components/currency-icon";
import { Button } from "@/components/ui/button";
import {
     FormDescription,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
     Tooltip,
     TooltipContent,
     TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddProductFormType } from "@/types/add-products";
import { useEffect, useState } from "react";

export default function PriceFiled({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const priceValues = form.watch("price");

     const pricerErrorStatus = form.getFieldState("price");

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
                         {priceValues.length > 0 &&
                              priceValues.map((variantPrice, inx) => (
                                   <PriceInput
                                        key={variantPrice.variantId}
                                        variantPrice={variantPrice}
                                        form={form}
                                        isFormReset={isFormReset}
                                        error={
                                             pricerErrorStatus.invalid &&
                                             pricerErrorStatus?.error
                                                  ? (
                                                         pricerErrorStatus.error as unknown as {
                                                              [
                                                                   key: number
                                                              ]: PriceErrorType;
                                                         }
                                                    )[inx]
                                                  : null
                                        }
                                   />
                              ))}
                         <div>
                              <Button
                                   type="button"
                                   variant="ghost"
                                   className="cursor-pointer"
                                   onClick={() => {
                                        const variantSection =
                                             document.getElementById(
                                                  "variant-section"
                                             );
                                        if (variantSection) {
                                             variantSection.scrollIntoView({
                                                  behavior: "smooth",
                                             });
                                        }
                                   }}
                              >
                                   + Add Variant
                              </Button>
                         </div>

                         {/* price err message here */}

                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

function PriceInput({
     variantPrice,
     form,
     isFormReset,
     error,
}: {
     variantPrice: PriceVariantType;
     form: AddProductFormType;
     isFormReset: boolean;
     error: PriceErrorType | null;
}) {
     const [price, setPrice] = useState<string>(""); // use string to allow empty value
     const currency = form.watch("currency");
     const variants = form.watch("variants");
     const priceValue = form.watch("price");

     const matchVariant = variants.find(
          (item) => item.id === variantPrice.variantId
     );

     function handleChangeInputPrice(
          event: React.ChangeEvent<HTMLInputElement>
     ) {
          const inputValue = event.target.value;
          // Check if input is a valid number and not empty
          const isValid = inputValue !== "" && !isNaN(Number(inputValue));
          setPrice(inputValue);

          // Optionally, convert to number or set to null if invalid
          const priceValidInput = isValid ? Number(inputValue) : null;
          if (priceValidInput) {
               const finalPriceArray = priceValue.map((item) =>
                    item.variantId === variantPrice.variantId
                         ? { ...item, price: priceValidInput }
                         : item
               );

               form.setValue("price", finalPriceArray);
               form.clearErrors("price");
          } else {
               form.setValue("price", 0);
          }
     }

     function handelRadioOnchange(event: React.ChangeEvent<HTMLInputElement>) {
          const isCheck = event.target.checked;
          const selectedFalseArray = priceValue.map((item) => ({
               ...item,
               select: false,
          }));
          const finalPriceArray = selectedFalseArray.map((item) =>
               item.variantId === variantPrice.variantId
                    ? { ...item, select: isCheck }
                    : item
          );

          form.setValue("price", finalPriceArray);
          form.clearErrors("price");
     }

     useEffect(() => {
          if (isFormReset) {
               setPrice("");
          }
     }, [isFormReset]);

     return (
          <>
               <div className="flex items-center gap-4 py-2 border-gray-200 last:border-b-0">
                    <div className="w-1/3 flex items-center">
                         {matchVariant && (
                              <span className="font-medium text-gray-700 capitalize">
                                   {matchVariant.title.toLocaleLowerCase()}*
                              </span>
                         )}
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
                         <div>
                              <Tooltip>
                                   <TooltipTrigger>
                                        {/* Replace the Button with a radio input */}
                                        <label className="flex items-center cursor-pointer">
                                             <input
                                                  type="radio"
                                                  name="selected"
                                                  checked={variantPrice.select}
                                                  onChange={handelRadioOnchange}
                                                  className="form-radio h-4 w-4 text-primary-500 focus:ring-primary-500 border-gray-300"
                                             />
                                        </label>
                                   </TooltipTrigger>
                                   <TooltipContent className="text-white">
                                        Selected show on product cart default.
                                   </TooltipContent>
                              </Tooltip>
                         </div>
                    </div>
               </div>

               {error && (
                    <p className="text-red-500 text-sm">
                         {error.price?.message as string}
                    </p>
               )}
          </>
     );
}

interface PriceVariantType {
     price: number;
     variantId: string;
     select: boolean;
}

interface PriceErrorType {
     price?: { message: string };
}
