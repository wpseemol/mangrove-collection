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
                                        className="resize-none bg-transparent w-full
                                border border-neutral-500/20 p-2 focus:outline-none focus-visible:ring-0
                                focus-visible:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] focus-visible:ring-offset-0 rounded"
                                        {...field}
                                   />
                              </FormControl>

                              <FormMessage />
                         </FormItem>
                    )}
               />
          </>
     );
}
