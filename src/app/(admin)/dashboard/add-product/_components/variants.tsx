"use client";

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
     SelectItem,
     SelectTrigger,
     SelectValue,
} from "@/components/ui/select";
import { KG_VARIANTS, PC_VARIANTS } from "@/lib/constant";
import { AddProductFormType } from "@/types/add-products";

import { useEffect, useState } from "react";

export default function Variants({ form }: { form: AddProductFormType }) {
     const [variants, setVariants] = useState<VariantsType[]>([]);
     const [finalSelectVariants, setFinalSelectVariants] = useState<
          FinalSelectVariantsType[]
     >([]);
     useEffect(() => {
          if (finalSelectVariants.length > 0) {
               form.setValue("variants", finalSelectVariants);
          }
     }, [finalSelectVariants, form]);

     // when form rest state also reset
     useEffect(() => {
          // Listen for reset event from the form
          const subscription = form.watch((value, { name }) => {
               if (name === undefined) {
                    setFinalSelectVariants([]);
                    setVariants([{ id: crypto.randomUUID() }]);
                    selectedValue = "";
               }
          });
          return () => subscription.unsubscribe(); // clan up function
     }, [form]);
     // when form rest state also reset

     function handelAddOption() {
          setVariants((pre) => [...pre, { id: crypto.randomUUID() }]);
     }

     console.log(variants);

     return (
          <>
               <div className="mb-4" id="variant-section">
                    <FormLabel className="mb-1">Variants</FormLabel>
                    {/* default value */}
                    <div className="grid grid-cols-3 gap-3 mb-3 last:mb-0 mt-1">
                         <Select defaultValue="default" disabled>
                              <SelectTrigger
                                   className="bg-transparent border border-neutral-500/20 p-2 focus:outline-none  
                    focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] col-span-1 w-full"
                              >
                                   <SelectValue
                                        placeholder={`Select what type of variants`}
                                   />
                              </SelectTrigger>

                              <SelectContent
                                   className="bg-[#f0f1f7] dark:bg-[#252729] border border-neutral-500/20
                p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]"
                              >
                                   <SelectItem
                                        value="default"
                                        className="border border-neutral-700/15 mb-0.5"
                                   >
                                        Default
                                   </SelectItem>
                              </SelectContent>
                         </Select>
                         <Input
                              disabled
                              value={"Regular"}
                              type="text"
                              name="varian-title"
                              id="varian-title-default"
                              className="w-full bg-transparent border border-neutral-500/20 col-span-2
                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                              placeholder="Variant title"
                         />
                    </div>
                    {/* default value */}
                    {variants.length > 0 &&
                         variants.map((item) => (
                              <VariantsInput
                                   key={item.id}
                                   form={form}
                                   id={item.id}
                                   setFinalSelectVariants={
                                        setFinalSelectVariants
                                   }
                              />
                         ))}

                    {/* option add btn */}
                    <div
                         onClick={handelAddOption}
                         className="w-fit text-sm mt-8 cursor-pointer "
                    >
                         <p className="text-green-600 hover:text-green-700 duration-100">
                              +{" "}
                              <span className="font-medium">
                                   Add another option
                              </span>
                         </p>
                    </div>
                    {/* option add btn */}
                    <ErrorMassage form={form} type="variants" />
               </div>
          </>
     );
}

type VariantsType = {
     id: string;
};

type VariantsArrayType = {
     id: number;
     type: string;
     value: string;
};

type VariantsInputType = {
     form: AddProductFormType;
     id: string;
     setFinalSelectVariants: React.Dispatch<
          React.SetStateAction<FinalSelectVariantsType[]>
     >;
};

let selectedValue = "";

function VariantsInput({
     form,
     id,
     setFinalSelectVariants,
}: VariantsInputType) {
     const [variantsTypes, setVariantsTypes] = useState<
          VariantsArrayType[] | []
     >([]);
     const [isDisable, setIsDisable] = useState(!selectedValue);
     const [type, setType] = useState(selectedValue);

     const productUnit = form.watch("unit");

     useEffect(() => {
          switch (productUnit) {
               case "pc":
                    setVariantsTypes(PC_VARIANTS);

                    break;
               case "kg":
                    setVariantsTypes(KG_VARIANTS);

                    break;
          }
     }, [productUnit, form]);

     function handelSelectChange(value: string) {
          selectedValue = value;
          setIsDisable(!selectedValue);
          setType(value);
     }

     function handelValueChange(event: React.ChangeEvent<HTMLInputElement>) {
          const variantInputValue = event.target.value;
          const obj: FinalSelectVariantsType = {
               id,
               type,
               title: variantInputValue,
          };
          setFinalSelectVariants((prev) => {
               const index = prev.findIndex((item) => item?.id === id);

               if (index !== -1) {
                    return prev.map((item, i) => (i === index ? obj : item));
               } else {
                    return [...prev, obj];
               }
          });
     }

     return (
          <div className="grid grid-cols-3 gap-3 mb-3 last:mb-0">
               {" "}
               <TypeSelector
                    variantsTypes={variantsTypes}
                    handelSelectChange={handelSelectChange}
               />
               <Input
                    onChange={handelValueChange}
                    readOnly={isDisable}
                    title={isDisable ? "Please select variant type fist." : ""}
                    type="text"
                    name="varian-title"
                    id="varian-title"
                    className="w-full bg-transparent border border-neutral-500/20 col-span-2
                            p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] rounded"
                    placeholder="Variant title"
               />
          </div>
     );
}

type TypeSelectorProps = {
     variantsTypes: VariantsArrayType[];
     handelSelectChange: (value: string) => void;
};

function TypeSelector({
     variantsTypes,
     handelSelectChange,
}: TypeSelectorProps) {
     return (
          <Select
               onValueChange={handelSelectChange}
               defaultValue={selectedValue}
          >
               <FormControl>
                    <SelectTrigger
                         className="bg-transparent border border-neutral-500/20 p-2 focus:outline-none  
                    focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] col-span-1 w-full"
                    >
                         <SelectValue
                              placeholder={`Select what type of variants`}
                         />
                    </SelectTrigger>
               </FormControl>
               <SelectContent
                    className="bg-[#f0f1f7] dark:bg-[#252729] border border-neutral-500/20
                p-2 focus:outline-none  focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]"
               >
                    {variantsTypes?.map((item) => (
                         <SelectItem
                              key={item.id}
                              value={item.value}
                              className="border border-neutral-700/15 mb-0.5"
                         >
                              {item.type}
                         </SelectItem>
                    ))}{" "}
               </SelectContent>
          </Select>
     );
}

type ErrorMassageType = {
     form: AddProductFormType;
     type: string;
};

function ErrorMassage({ form, type }: ErrorMassageType) {
     return (
          <>
               <FormField
                    control={form.control}
                    name={type}
                    render={({ fieldState }) => (
                         <FormItem>
                              <FormMessage>
                                   {fieldState.error?.message}
                              </FormMessage>
                         </FormItem>
                    )}
               />
          </>
     );
}

type FinalSelectVariantsType = {
     id: string;
     type: string;
     title: string;
};
