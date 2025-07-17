"use client";

import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import {
     Form,
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { productContentUpdate } from "@/lib/actions/product";
import { productSlugSchema } from "@/lib/schemas/zod/edit-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { z } from "zod";

export default function ProductSlugForm({
     content,
     productId,
}: {
     content: string;
     productId: string;
}) {
     const [isDisable, setIsDisable] = React.useState<boolean>(true);

     const usePathName = usePathname();
     const router = useRouter();

     const form = useForm<z.infer<typeof productSlugSchema>>({
          resolver: zodResolver(productSlugSchema),
          defaultValues: {
               slug: content,
          },
     });

     const inputSlugValue = form.watch("slug");
     useEffect(() => {
          setIsDisable(inputSlugValue === content);
     }, [inputSlugValue, content]);

     async function onSubmit(values: z.infer<typeof productSlugSchema>) {
          const response = await productContentUpdate(
               productId,
               values,
               "slug",
               usePathName
          );

          if (response.success) {
               router.push(`/dashboard/products/${inputSlugValue}/edit`);
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
                         name="slug"
                         render={({ field }) => (
                              <FormItem>
                                   <FormLabel className="text-gray-700 font-medium">
                                        Slug
                                   </FormLabel>
                                   <FormControl>
                                        <Input
                                             {...field}
                                             placeholder="Enter product name"
                                             className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                        />
                                   </FormControl>
                                   <FormMessage className="text-red-500 text-sm" />
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
