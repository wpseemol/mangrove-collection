"use client";

import TiptapMenuBar from "@/components/tiptap-menu-bar";
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
import { productContentUpdate } from "@/lib/actions/product";
import { productDescriptionSchema } from "@/lib/schemas/zod/edit-product-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Color } from "@tiptap/extension-color";
import Emoji from "@tiptap/extension-emoji";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import Table from "@tiptap/extension-table";
import TableCell from "@tiptap/extension-table-cell";
import TableHeader from "@tiptap/extension-table-header";
import TableRow from "@tiptap/extension-table-row";
import TextStyle from "@tiptap/extension-text-style";
import Youtube from "@tiptap/extension-youtube";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import "./../tiptap-style.css";

export default function ProductDescriptionForm({
     content,
     productId,
}: {
     content: string;
     productId: string;
}) {
     const [isDisable, setIsDisable] = useState<boolean>(true);

     const usePathName = usePathname();

     const form = useForm<z.infer<typeof productDescriptionSchema>>({
          resolver: zodResolver(productDescriptionSchema),
          defaultValues: {
               description: content,
          },
     });

     const editor = useEditor({
          immediatelyRender: false,
          extensions: [
               Placeholder.configure({
                    placeholder: "Write something …",
               }),
               Emoji.configure({
                    enableEmoticons: true,
               }),
               Youtube.configure({
                    inline: false,
                    controls: true,
                    nocookie: true,
                    HTMLAttributes: {
                         class: "rounded-md border border-gray-200 dark:border-neutral-700",
                         allowfullscreen: "true",
                    },
               }),
               Table.configure({
                    resizable: true,
                    HTMLAttributes: {
                         class: "border border-gray-300 dark:border-neutral-700 rounded overflow-hidden table-auto w-full",
                    },
               }),
               TableRow,
               TableHeader,
               TableCell,
               StarterKit.configure({
                    heading: {
                         levels: [1, 2, 3],
                    },
                    bulletList: {
                         keepMarks: true,
                         keepAttributes: true,
                    },
                    orderedList: {
                         keepMarks: true,
                         keepAttributes: true,
                    },
               }),
               Highlight.configure({
                    multicolor: true,
               }),
               Link.configure({
                    openOnClick: false,
                    HTMLAttributes: {
                         class: "text-blue-500 hover:underline dark:text-blue-400",
                    },
               }),
               Image.configure({
                    HTMLAttributes: {
                         class: "rounded-md border border-gray-200 dark:border-neutral-700",
                    },
                    allowBase64: true,
               }),
               TextStyle,
               Color,
          ],
          content: content,
          editorProps: {
               attributes: {
                    class: "min-h-[160px] outline-none prose prose-sm focus:outline-none border border-gray-200 dark:border-neutral-700 p-1 tiptap rounded-b-md focus:shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px] space-y-0.5 bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 border-t-0 -mt-1",
               },
          },
          onUpdate: ({ editor }) => {
               const html = editor.getHTML();

               form.setValue("description", html, {
                    shouldValidate: true,
                    shouldDirty: true,
               });
          },
     });

     const inputDescriptionValue = form.watch("description");
     useEffect(() => {
          setIsDisable(inputDescriptionValue === content);
     }, [inputDescriptionValue, content]);

     async function onSubmit(values: z.infer<typeof productDescriptionSchema>) {
          const response = await productContentUpdate(
               productId,
               values,
               "description",
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
                         name="description"
                         render={() => (
                              <FormItem>
                                   <FormLabel className="mb-1 ">
                                        Description*
                                   </FormLabel>
                                   <TiptapMenuBar editor={editor} />
                                   <FormControl className="md:max-h-[calc(100vh-15rem)] sm:max-h-[calc(100vh-17rem)] max-h-[calc(100vh-21rem)] overflow-y-auto">
                                        <EditorContent editor={editor} />
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
