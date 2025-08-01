"use client";

import { CurrencyIcon } from "@/components/currency-icon";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
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
import {
     Tooltip,
     TooltipContent,
     TooltipTrigger,
} from "@/components/ui/tooltip";
import { KG_VARIANTS, PC_VARIANTS } from "@/lib/constant";

import { productPriceVariantSchema } from "@/lib/schemas/zod/edit-product-schema";
import { generateUniqueIds } from "@/utils/unique-id-generate";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

export default function ProductPriceVariantForm({
     content,
     productId,
     productUnit,
     productCurrency,
}: {
     content: string;
     productId: string;
     productUnit: string;
     productCurrency: string;
}) {
     const [isDisable, setIsDisable] = useState<boolean>(true);
     const pathName = usePathname();

     const defaultPriceVariantValue = JSON.parse(content) as PriceVariantType;

     const form = useForm<PriceVariantType>({
          resolver: zodResolver(productPriceVariantSchema),
          defaultValues: defaultPriceVariantValue,
     });

     const changeContent = form.watch();

     useEffect(() => {
          setIsDisable(JSON.stringify(changeContent) === content);
     }, [content, changeContent]);

     function handelAddVariant() {
          const variantObj: VariantType = {
               id: generateUniqueIds({ pattern: "****" }) as string,
               type: lestSelectedVariantType,
               title: "",
          };

          form.setValue("variants", [
               ...form.getValues("variants"),
               variantObj,
          ]);
     }

     async function onSubmit(values: PriceVariantType) {
          console.log("Form submitted with values:", values);
          toast.success("Product price variants updated successfully!");
     }

     const variantFiledStatus = form.getFieldState("variants");
     const priceFiledStatus = form.getFieldState("price");

     return (
          <Form {...form}>
               <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4 max-h-[calc(100vh-10rem)] overflow-y-auto md:min-w-[30rem]"
               >
                    {/* Variants Section */}
                    <div className="space-y-2">
                         <h3 className="font-medium text-gray-700">Variants</h3>
                         <DefaultVariants form={form} />

                         {changeContent.variants.length > 0 &&
                              changeContent.variants.map((variant, inx) => (
                                   <ChangeVariant
                                        key={variant.id}
                                        variant={variant}
                                        form={form}
                                        productUnit={productUnit}
                                        error={
                                             variantFiledStatus.invalid &&
                                             variantFiledStatus?.error
                                                  ? (
                                                         variantFiledStatus.error as unknown as {
                                                              [
                                                                   key: number
                                                              ]: VariantErrorType;
                                                         }
                                                    )[inx]
                                                  : null
                                        }
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

                    {/* Prices Section */}
                    <div className="space-y-2">
                         <h3 className="font-medium text-gray-700">Prices</h3>
                         {changeContent.price.length > 0 &&
                              changeContent.price.map((price, inx) => (
                                   <ChangePriceFiled
                                        key={price.variantId}
                                        form={form}
                                        price={price}
                                        productCurrency={productCurrency}
                                        error={
                                             priceFiledStatus.invalid &&
                                             priceFiledStatus?.error
                                                  ? (
                                                         priceFiledStatus.error as unknown as {
                                                              [
                                                                   key: number
                                                              ]: PriceErrorType;
                                                         }
                                                    )[inx]
                                                  : null
                                        }
                                   />
                              ))}
                    </div>

                    <DialogFooter className="mt-4">
                         <DialogClose asChild>
                              <Button variant="outline">Cancel</Button>
                         </DialogClose>
                         <Button
                              disabled={
                                   isDisable || form.formState.isSubmitting
                              }
                              type="submit"
                              className="text-white disabled:cursor-not-allowed disabled:pointer-events-auto cursor-pointer"
                         >
                              {form.formState.isSubmitting
                                   ? "Saving..."
                                   : "Save changes"}
                         </Button>
                    </DialogFooter>
               </form>
          </Form>
     );
}

function DefaultVariants({
     form,
}: {
     form: UseFormReturn<z.infer<typeof productPriceVariantSchema>>;
}) {
     const defaultVariants = form
          .getValues("variants")
          .find((variant) => variant.type === "default");

     if (!defaultVariants) {
          return;
     }

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

function ChangeVariant({
     variant,
     form,
     productUnit,
     error,
}: {
     variant: VariantType;
     form: UseFormReturn<z.infer<typeof productPriceVariantSchema>>;
     productUnit: string;
     error?: VariantErrorType | null;
}) {
     if (variant.type === "default") {
          return;
     }
     const variantArrayObj = {
          pc: PC_VARIANTS,
          kg: KG_VARIANTS,
     };

     const unit = productUnit as keyof typeof variantArrayObj;

     const [selectVariant, setSelectVariant] = useState<string>(variant.type);
     lestSelectedVariantType = variant.type;

     /**
      * remove variant
      */
     function handleCancelVariant() {
          form.setValue(
               "variants",
               form
                    .getValues("variants")
                    .filter((item) => item.id !== variant.id)
          );

          form.setValue(
               "price",
               form
                    .getValues("price")
                    .filter((item) => item.variantId !== variant.id)
          );
     }

     /**
      * variant title input
      */
     function handleVariantInputChange(
          event: React.ChangeEvent<HTMLInputElement>
     ) {
          const variantTitle = event.target.value;
          const currentVariants = form.getValues("variants");
          const currentPrices = form.getValues("price");

          const updatedVariants = currentVariants.map((item) =>
               item.id === variant.id ? { ...item, title: variantTitle } : item
          );

          form.setValue("variants", updatedVariants);

          const existingPriceIndex = currentPrices.findIndex(
               (price) => price.variantId === variant.id
          );

          if (existingPriceIndex >= 0) {
               form.setValue("price", currentPrices);
          } else {
               form.setValue("price", [
                    ...currentPrices,
                    {
                         variantId: variant.id,
                         price: 0,
                         select: false,
                    },
               ]);
          }
     }

     /**
      * selected value change
      * @param value string
      */
     function handelOneSelectValueChange(value: string) {
          setSelectVariant(value);

          form.setValue(
               "variants",
               form
                    .getValues("variants")
                    .map((item) =>
                         item.id === variant.id
                              ? { ...item, type: value }
                              : item
                    )
          );
     }

     return (
          <>
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

                                        {variantArrayObj[unit].map(
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
                              value={variant.title}
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
               {error && (
                    <p className="text-red-500 text-sm">
                         {error.title?.message as string}
                    </p>
               )}
          </>
     );
}

function ChangePriceFiled({
     price,
     form,
     error,
     productCurrency,
}: {
     price: PriceType;
     form: UseFormReturn<z.infer<typeof productPriceVariantSchema>>;
     error?: PriceErrorType | null;
     productCurrency: string;
}) {
     const variant = form
          .watch("variants")
          .find((variant) => variant.id === price.variantId);

     if (!variant || !variant.title) {
          return;
     }

     function handleChangeInputPrice(
          event: React.ChangeEvent<HTMLInputElement>
     ) {
          const inputValue = event.target.valueAsNumber;

          if (isNaN(inputValue) || inputValue < 0) {
               return;
          }

          const priceValue = form.getValues("price");

          const finalPriceArray = priceValue.map((item) =>
               item.variantId === price.variantId
                    ? { ...item, price: inputValue || 0 }
                    : item
          );

          form.setValue("price", finalPriceArray);
     }

     function handelRadioOnchange(event: React.ChangeEvent<HTMLInputElement>) {
          const isCheck = event.target.checked;
          const priceValue = form.getValues("price");

          const finalPriceArray = priceValue.map((item) =>
               item.variantId === price.variantId
                    ? { ...item, select: isCheck }
                    : { ...item, select: false }
          );

          form.setValue("price", finalPriceArray);
     }

     return (
          <>
               <div className="flex items-center gap-4 py-2 border-gray-200 last:border-b-0">
                    <div className="w-1/4 flex items-center">
                         {variant && (
                              <span className="font-medium text-gray-700 capitalize">
                                   {variant.title.toLocaleLowerCase()}*
                              </span>
                         )}
                    </div>
                    <div className="w-3/4 flex items-center gap-2">
                         <span className="text-gray-500">:</span>
                         <Input
                              onChange={handleChangeInputPrice}
                              value={price.price || ""}
                              placeholder="Enter price"
                              className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                              type="number"
                              min={1}
                              step="0.01"
                         />
                         <span className="text-gray-400 text-sm">
                              <CurrencyIcon currency={productCurrency} />
                         </span>
                         <div>
                              <Tooltip>
                                   <TooltipTrigger>
                                        {/* Replace the Button with a radio input */}
                                        <label className="flex items-center cursor-pointer">
                                             <input
                                                  type="radio"
                                                  name="selected"
                                                  checked={price.select}
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

type PriceVariantType = z.infer<typeof productPriceVariantSchema>;

type UnitType = "pc" | "kg";

interface VariantType {
     id: string;
     type: string;
     title: string;
}

let lestSelectedVariantType = "";

interface VariantErrorType {
     title: { message: string };
}

interface PriceType {
     price: number;
     variantId: string;
     select: boolean;
}

interface PriceErrorType {
     price?: { message: string };
}
