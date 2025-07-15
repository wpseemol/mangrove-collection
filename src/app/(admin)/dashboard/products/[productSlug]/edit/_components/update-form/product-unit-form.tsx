"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
     Form,
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
import { productContentUpdate } from "@/lib/actions/product";
import { PRODUCT_UNITS } from "@/lib/constant";
import { productUnitSchema } from "@/lib/schemas/zod/edit-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export default function ProductUnitForm({
     content,
     productId,
}: {
     content: string;
     productId: string;
}) {
     const [isDisable, setIsDisable] = useState<boolean>(true);

     const usePathName = usePathname();

     const form = useForm<z.infer<typeof productUnitSchema>>({
          resolver: zodResolver(productUnitSchema),
          defaultValues: {
               unit: content,
          },
     });

     const inputUnitValue = form.watch("unit");
     useEffect(() => {
          setIsDisable(inputUnitValue === content);
     }, [inputUnitValue, content]);

     async function onSubmit(values: z.infer<typeof productUnitSchema>) {
          const response = await productContentUpdate(
               productId,
               values,
               "unit",
               usePathName
          );

          if (response.success) {
               toast.success(response.message);
          } else {
               toast.error(response.message);
          }
     }

     return (
          <Form {...form}>
               <form onSubmit={form.handleSubmit(onSubmit)}>
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
                    <DialogFooter className="mt-2">
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
