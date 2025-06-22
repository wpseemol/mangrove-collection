"use client";

import {
     FormControl,
     FormField,
     FormItem,
     FormLabel,
     FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { AddProductFormType } from "@/types/add-products";
import { useEffect, useState } from "react";
import { IoMdCloseCircle } from "react-icons/io";

interface TagsComponentProps {
     form: AddProductFormType;
}

export default function TagsComponent({ form }: TagsComponentProps) {
     const [tags, setTags] = useState<string[]>([]);
     const [tagInput, setTagInput] = useState("");
     const [isFocused, setIsFocused] = useState(false);

     // Sync tags with form
     useEffect(() => {
          form.setValue("tags", tags);
     }, [tags, form]);

     const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
          form.clearErrors("tags");
          const inputValue = event.target.value;
          setTagInput(inputValue);

          if (inputValue.includes(";")) {
               const newTag = inputValue.split(";")[0].trim(); // Only take text before the semicolon

               if (newTag && !tags.includes(newTag)) {
                    setTags((prev) => [...prev, newTag]);
                    // Keep remaining text after semicolon in input
                    const remainingText = inputValue
                         .split(";")
                         .slice(1)
                         .join(";")
                         .trim();
                    setTagInput(remainingText);
               } else if (tags.includes(newTag)) {
                    form.setError("tags", {
                         type: "manual",
                         message: "Tags must be unique",
                    });
                    // Keep the input as is (with semicolon) so user can correct it
               }
          }
     };

     const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
          if (event.key === "Enter" && tagInput.trim()) {
               event.preventDefault();
               const newTag = tagInput.trim();

               if (!tags.includes(newTag)) {
                    setTags((prev) => [...prev, newTag]);
                    setTagInput("");
               } else {
                    form.setError("tags", {
                         type: "manual",
                         message: "Tags must be unique",
                    });
               }
          }
     };

     const handleDeleteTag = (tagToDelete: string) => {
          setTags((prev) => prev.filter((tag) => tag !== tagToDelete));
     };

     return (
          <FormField
               control={form.control}
               name="tags"
               render={({ fieldState }) => (
                    <FormItem>
                         <FormLabel className="mb-1">Tags</FormLabel>
                         <FormControl>
                              <div
                                   className={`${
                                        isFocused
                                             ? "shadow-[rgba(17,_17,_26,_0.1)_0px_0px_16px]"
                                             : ""
                                   } 
              w-full bg-transparent border border-neutral-500/20
              p-2 rounded flex items-center gap-2 flex-wrap min-h-10 duration-150`}
                              >
                                   {tags.map((tag) => (
                                        <TagElement
                                             key={tag}
                                             tag={tag}
                                             onDelete={handleDeleteTag}
                                        />
                                   ))}
                                   <Input
                                        value={tagInput}
                                        onChange={handleInputChange}
                                        onKeyDown={handleKeyDown}
                                        onFocus={() => setIsFocused(true)}
                                        onBlur={() => setIsFocused(false)}
                                        className={`${
                                             tags.length > 0
                                                  ? "w-fit"
                                                  : "w-full"
                                        } bg-transparent border-none flex-grow min-w-[100px] placeholder:text-neutral-400`}
                                        placeholder="Add tags (separate with ; or press Enter)"
                                   />
                              </div>
                         </FormControl>
                         <FormMessage className="text-red-500">
                              {fieldState.error?.message}
                         </FormMessage>
                    </FormItem>
               )}
          />
     );
}

interface TagElementProps {
     tag: string;
     onDelete: (tag: string) => void;
}

function TagElement({ tag, onDelete }: TagElementProps) {
     return (
          <div className="flex items-center gap-1 bg-slate-400/35 rounded py-1 px-2">
               <span>{tag}</span>
               <button
                    type="button"
                    onClick={() => onDelete(tag)}
                    className="cursor-pointer hover:scale-110 duration-150"
                    aria-label={`Remove tag ${tag}`}
               >
                    <IoMdCloseCircle />
               </button>
          </div>
     );
}
