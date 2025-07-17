import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { AddProductFormType } from "@/types/add-products";

export default function ShortDescription({
     form,
}: {
     form: AddProductFormType;
}) {
     return (
          <>
               {" "}
               <FormField
                    control={form.control}
                    name="shortDescription"
                    render={({ field }) => (
                         <FormItem>
                              <FormLabel>Short description</FormLabel>

                              <FormControl>
                                   <Textarea
                                        placeholder="Short description type here ..."
                                        className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                        {...field}
                                   />
                              </FormControl>

                              <FormMessage className="text-red-500 text-sm" />
                         </FormItem>
                    )}
               />
          </>
     );
}
