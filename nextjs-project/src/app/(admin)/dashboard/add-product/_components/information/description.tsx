"use client";

import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import "./tiptap-style.css";

import TiptapMenuBar from "@/components/tiptap-menu-bar";
import { AddProductFormType } from "@/types/add-products";
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
import { useEffect } from "react";

export default function Description({
     form,
     isFormReset,
}: {
     form: AddProductFormType;
     isFormReset: boolean;
}) {
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
          content: "",
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

     useEffect(() => {
          if (isFormReset && editor) {
               editor.commands.clearContent();
          }
     }, [isFormReset, editor]);

     return (
          <FormField
               control={form.control}
               name="description"
               render={() => (
                    <FormItem>
                         <FormLabel className="mb-1">Description*</FormLabel>
                         <TiptapMenuBar editor={editor} />
                         <FormControl>
                              <EditorContent editor={editor} />
                         </FormControl>
                         <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
               )}
          />
     );
}
