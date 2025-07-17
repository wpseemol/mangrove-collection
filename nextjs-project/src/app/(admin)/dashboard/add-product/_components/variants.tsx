"use client";

import { Button } from "@/components/ui/button";
import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
     Select,
     SelectContent,
     SelectGroup,
     SelectItem,
     SelectLabel,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { KG_VARIANTS, PC_VARIANTS } from "@/lib/constant";
import { AddProductFormType } from "@/types/add-products";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

export default function Variants({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
     const [variants, setVariants] = useState<VariantType[] | null>(null);

     function handelAddVariant() {
          const variantObj: VariantType = {
               id: generateUniqueIds({ pattern: "****" }) as string,
          };

          setVariants((prev) => (prev ? [...prev, variantObj] : [variantObj]));
     }

     useEffect(() => {
          const defaultVariants = {
               id: "defaultId",
               type: "default",
               title: "Default",
          };
          const finalVariantArray: FinalVariantType[] = [defaultVariants];
          if (variants && variants.length > 0) {
               variants.forEach((variant) => {
                    if (variant?.title && variant?.type) {
                         finalVariantArray.push({
                              id: variant.id,
                              type: variant.type,
                              title: variant.title,
                         });
                    }
               });
          }
          form.setValue("variants", finalVariantArray);

          /**
           * price value set
           */
          form.setValue(
               "price",
               finalVariantArray.map((item) =>
                    item.id === defaultVariants.id
                         ? { variantId: item.id, price: 0, select: true }
                         : { variantId: item.id, price: 0, select: false }
               )
          );

          form.clearErrors("variants");
     }, [variants, form]);

     useEffect(() => {
          if (isFormReset) {
               setVariants(null);
          }
     }, [isFormReset]);

     return (
          <FormField
               control={form.control}
               name="variants"
               render={() => (
                    <FormItem>
                         <FormLabel className="text-gray-700 font-medium">
                              Product Variants
                         </FormLabel>
                         <FormControl>
                              <div>
                                   <DefaultVariants />
                                   {variants &&
                                        variants.length > 0 &&
                                        variants.map((variant) => (
                                             <VariantsInputSelect
                                                  key={variant.id}
                                                  form={form}
                                                  setVariants={setVariants}
                                                  variant={variant}
                                             />
                                        ))}

                                   <Button
                                        onClick={handelAddVariant}
                                        variant="ghost"
                                        className="text-md mt-2 cursor-pointer"
                                        type="button"
                                   >
                                        +{" "}
                                        <span className="font-medium">
                                             Add another option
                                        </span>
                                   </Button>
                              </div>
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}

function VariantsInputSelect({
     form,
     setVariants,
     variant,
}: {
     form: AddProductFormType;
     setVariants: Dispatch<SetStateAction<VariantType[] | null>>;
     variant: VariantType;
}) {
     const unit = form.watch("unit") as UnitType;

     const variantArrayObj = {
          pc: PC_VARIANTS,
          kg: KG_VARIANTS,
     };

     const [unitState, setUnitState] = useState<UnitType>(unit);
     const [selectVariant, setSelectVariant] = useState<string>(
          variantArrayObj[unitState][0].value
     );

     const [inputValue, setInputValue] = useState<string>("");

     useEffect(() => {
          setUnitState(unit);
     }, [unit]);

     /**
      * remove variant
      */
     function handleCancelVariant() {
          setVariants((prev) => {
               if (!prev) return null;
               const removeItem = prev.filter((item) => item.id !== variant.id);
               return removeItem.length > 0 ? removeItem : null;
          });
     }

     /**
      * variant title input
      */
     function handleVariantInputChange(
          event: React.ChangeEvent<HTMLInputElement>
     ) {
          const variantTitle = event.target.value;

          setInputValue(variantTitle);

          setVariants((prev) => {
               if (!prev) return null;
               return prev.map((item) =>
                    item.id === variant.id
                         ? { ...item, type: selectVariant, title: variantTitle }
                         : item
               );
          });
     }

     /**
      * selected value change
      * @param value string
      */
     function handelOneSelectValueChange(value: string) {
          setSelectVariant(value);

          setVariants((prev) => {
               if (!prev) return null;
               return prev.map((item) =>
                    item.id === variant.id ? { ...item, type: value } : item
               );
          });
     }

     return (
          <div className="flex items-center gap-2 mb-2 group">
               <div className="md:w-1/3 w-full ">
                    <Select
                         value={selectVariant}
                         onValueChange={(value) =>
                              handelOneSelectValueChange(value)
                         }
                    >
                         <SelectTrigger className="border-gray-200 w-full">
                              <SelectValue placeholder="Select Variant Type" />
                         </SelectTrigger>
                         <SelectContent className="bg-gray-50 border-gray-100">
                              <SelectGroup>
                                   <SelectLabel>Variants Type</SelectLabel>

                                   {variantArrayObj[unitState].map(
                                        (variantItem) => (
                                             <SelectItem
                                                  key={variantItem.id}
                                                  value={variantItem.value}
                                             >
                                                  {variantItem.type}
                                             </SelectItem>
                                        )
                                   )}
                              </SelectGroup>
                         </SelectContent>
                    </Select>
               </div>
               <div className="md:w-2/3 w-full flex md:flex-row flex-col md:border-none border-2 border-dashed border-gray-300 items-center gap-1 p-0.5 md:p-0 rounded">
                    <Input
                         value={inputValue}
                         onChange={handleVariantInputChange}
                         type="text"
                         placeholder="Variant Title"
                         className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800 duration-200"
                    />
                    <button
                         onClick={handleCancelVariant}
                         type="button"
                         className="group md:w-0 overflow-hidden md:p-0 rounded border border-transparent  group-hover:w-fit group-hover:border-gray-200 group-hover:p-2 duration-200 flex justify-center items-center"
                    >
                         <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 16 16"
                              className="text-red-400 group-hover:text-red-500 duration-150"
                         >
                              <path
                                   stroke="currentColor"
                                   strokeLinecap="round"
                                   strokeLinejoin="round"
                                   strokeWidth="2"
                                   d="M4 4l8 8M12 4l-8 8"
                              />
                         </svg>
                    </button>
               </div>
          </div>
     );
}

function DefaultVariants() {
     const defaultVariants = {
          id: "defaultId",
          type: "default",
          title: "Default",
     };

     return (
          <div className="flex items-center gap-2 mb-2">
               <div className="md:w-1/3 w-full">
                    <Select value={defaultVariants.id}>
                         <SelectTrigger
                              disabled
                              className="border-gray-200 w-full"
                         >
                              <SelectValue placeholder="Select Variant Type" />
                         </SelectTrigger>
                         <SelectContent className="bg-gray-50 border-gray-100">
                              <SelectGroup>
                                   <SelectLabel>Variants Type</SelectLabel>

                                   <SelectItem value={defaultVariants.id}>
                                        {defaultVariants.title}
                                   </SelectItem>
                              </SelectGroup>
                         </SelectContent>
                    </Select>
               </div>
               <div className="md:w-2/3 w-full">
                    <Input
                         disabled
                         value={defaultVariants.title}
                         placeholder="Variant Title"
                         className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                    />
               </div>
          </div>
     );
}

type UnitType = "pc" | "kg";

interface VariantType {
     id: string;
     type?: string;
     title?: string;
}

interface FinalVariantType {
     id: string;
     type: string;
     title: string;
}
