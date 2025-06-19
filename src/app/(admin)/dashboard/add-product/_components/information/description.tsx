"use client";

import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { AddProductFormType } from "@/types/add-product";
import "./tiptap-style.css";

import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextStyle from "@tiptap/extension-text-style";
import { EditorContent, Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapMenuBar from "./tiptap-menu-bar";

export default function Description({ form }: { form: AddProductFormType }) {
     const editor = useEditor({
          extensions: [
               StarterKit.configure({
                    // Disable included extensions we're replacing
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
                         class: "text-blue-500 hover:underline",
                    },
               }),
               Image.configure({
                    HTMLAttributes: {
                         class: "rounded-md border",
                    },
               }),
               TextStyle,
               Color,
               TagExtension,
          ],
          content: "",
          editorProps: {
               attributes: {
                    class: "min-h-[120px] outline-none prose prose-sm focus:outline-none border border-gray-200 p-1 tiptap rounded",
               },
          },
     });

     return (
          <>
               <FormField
                    control={form.control}
                    name="description"
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    render={({ field, fieldState }) => (
                         <FormItem>
                              <FormLabel className="mb-1">
                                   Description*
                              </FormLabel>
                              <TiptapMenuBar editor={editor} />
                              <FormControl>
                                   <EditorContent
                                        editor={editor}
                                        className=""
                                   />
                              </FormControl>
                              <FormMessage>
                                   {fieldState.error?.message}
                              </FormMessage>
                         </FormItem>
                    )}
               />
          </>
     );
}

// Custom Tag extension
const TagExtension = Extension.create({
     name: "tag",
     addOptions() {
          return {
               HTMLAttributes: {},
          };
     },
     addAttributes() {
          return {
               id: {
                    default: null,
               },
          };
     },
     parseHTML() {
          return [
               {
                    tag: "span[data-tag]",
                    getAttrs: (dom) => {
                         if (typeof dom === "string") return {};
                         const element = dom as HTMLElement;
                         return {
                              id: element.getAttribute("data-tag-id"),
                         };
                    },
               },
          ];
     },
     renderHTML({ HTMLAttributes }) {
          return [
               "span",
               {
                    "data-tag": true,
                    "data-tag-id": HTMLAttributes.id,
                    class: "tag",
               },
               ["span", { class: "tag-content" }, `#${HTMLAttributes.id}`],
          ];
     },
});
