"use client";
// import ImageUpload from "@/components/image-upload"; // Assuming you have an image upload component
import { Button } from "@/components/ui/button";
import {
     Form,
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
import { Toaster } from "@/components/ui/sonner";
import { Textarea } from "@/components/ui/textarea";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { ProductDetailsType } from "@/types/mongoose/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

export default function EditProductForm({
     productInfo,
}: {
     productInfo: ProductDetailsType;
}) {
     const [thumbnail, setThumbnail] = useState(productInfo.thumbnail || "");
     const [images, setImages] = useState<string[]>(productInfo.images || []);
     const [tags, setTags] = useState<string[]>(productInfo.tags || []);

     const form = useForm<z.infer<typeof addProductSchema>>({
          resolver: zodResolver(addProductSchema),
          defaultValues: {
               name: productInfo.name || "",
               slug: productInfo.slug || "",
               unit: productInfo.unit || "pc",
               description: "",
               thumbnail: productInfo.thumbnail || "",
               images: productInfo.images || [],
               variants: productInfo.variants || [
                    { id: "defaultId", type: "default", title: "Default" },
               ],
               currency: productInfo.currency || "taka",
               price: productInfo.price || [
                    { variantId: "defaultId", price: 1, select: true },
               ],
               category: productInfo.category || "",
               shortDescription: productInfo.shortDescription || "",
               tags: productInfo.tags || [],
          },
     });

     /**
      * form submit here.
      * @onSubmit
      */
     async function onSubmit(values: z.infer<typeof addProductSchema>) {
          console.log("form submit value:", values);
          // Here you would typically call your API to update the product
          try {
               // const response = await updateProduct(productInfo._id, values);
               // Handle success
          } catch (error) {
               // Handle error
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="grid md:grid-cols-3 grid-cols-1 gap-4 md:mx-5 mb-5"
                    >
                         {/* Product Name */}
                         <FormField
                              control={form.control}
                              name="name"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-3">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Product Name*
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

                         {/* Slug */}
                         <FormField
                              control={form.control}
                              name="slug"
                              render={({ field }) => (
                                   <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                             Slug*
                                        </FormLabel>
                                        <FormControl>
                                             <Input
                                                  {...field}
                                                  placeholder="product-slug"
                                                  className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                             />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Unit */}
                         <FormField
                              control={form.control}
                              name="unit"
                              render={({ field }) => (
                                   <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                             Unit*
                                        </FormLabel>
                                        <Select
                                             onValueChange={field.onChange}
                                             defaultValue={field.value}
                                        >
                                             <FormControl>
                                                  <SelectTrigger>
                                                       <SelectValue placeholder="Select unit" />
                                                  </SelectTrigger>
                                             </FormControl>
                                             <SelectContent>
                                                  <SelectItem value="pc">
                                                       Piece
                                                  </SelectItem>
                                                  <SelectItem value="kg">
                                                       Kilogram
                                                  </SelectItem>
                                                  <SelectItem value="g">
                                                       Gram
                                                  </SelectItem>
                                                  <SelectItem value="l">
                                                       Liter
                                                  </SelectItem>
                                                  <SelectItem value="ml">
                                                       Milliliter
                                                  </SelectItem>
                                             </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Currency */}
                         <FormField
                              control={form.control}
                              name="currency"
                              render={({ field }) => (
                                   <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                             Currency*
                                        </FormLabel>
                                        <Select
                                             onValueChange={field.onChange}
                                             defaultValue={field.value}
                                        >
                                             <FormControl>
                                                  <SelectTrigger>
                                                       <SelectValue placeholder="Select currency" />
                                                  </SelectTrigger>
                                             </FormControl>
                                             <SelectContent>
                                                  <SelectItem value="taka">
                                                       Taka
                                                  </SelectItem>
                                                  <SelectItem value="usd">
                                                       USD
                                                  </SelectItem>
                                                  <SelectItem value="eur">
                                                       Euro
                                                  </SelectItem>
                                             </SelectContent>
                                        </Select>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Category */}
                         <FormField
                              control={form.control}
                              name="category"
                              render={({ field }) => (
                                   <FormItem>
                                        <FormLabel className="text-gray-700 font-medium">
                                             Category*
                                        </FormLabel>
                                        <FormControl>
                                             <Input
                                                  {...field}
                                                  placeholder="Enter category"
                                                  className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                             />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Short Description */}
                         <FormField
                              control={form.control}
                              name="shortDescription"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-2">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Short Description
                                        </FormLabel>
                                        <FormControl>
                                             <Input
                                                  {...field}
                                                  placeholder="Enter short description"
                                                  className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                             />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Description */}
                         <FormField
                              control={form.control}
                              name="description"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-3">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Description
                                        </FormLabel>
                                        <FormControl>
                                             <Textarea
                                                  {...field}
                                                  placeholder="Enter product description"
                                                  className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800 min-h-[100px]"
                                             />
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Thumbnail */}
                         <FormField
                              control={form.control}
                              name="thumbnail"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-3">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Thumbnail
                                        </FormLabel>
                                        <FormControl>
                                             {/* <ImageUpload
                                                  value={thumbnail}
                                                  onChange={(url) => {
                                                       setThumbnail(url);
                                                       field.onChange(url);
                                                  }}
                                                  onRemove={() => {
                                                       setThumbnail("");
                                                       field.onChange("");
                                                  }}
                                             /> */}
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Images */}
                         <FormField
                              control={form.control}
                              name="images"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-3">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Images
                                        </FormLabel>
                                        <FormControl>
                                             {/* <ImageUpload
                                                  multiple
                                                  value={images}
                                                  onChange={(urls) => {
                                                       setImages(urls);
                                                       field.onChange(urls);
                                                  }}
                                                  onRemove={(url) => {
                                                       const newImages =
                                                            images.filter(
                                                                 (image) =>
                                                                      image !==
                                                                      url
                                                            );
                                                       setImages(newImages);
                                                       field.onChange(
                                                            newImages
                                                       );
                                                  }}
                                             /> */}
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Tags */}
                         <FormField
                              control={form.control}
                              name="tags"
                              render={({ field }) => (
                                   <FormItem className="md:col-span-3">
                                        <FormLabel className="text-gray-700 font-medium">
                                             Tags
                                        </FormLabel>
                                        <FormControl>
                                             <div>
                                                  <Input
                                                       placeholder="Add tags (press enter to add)"
                                                       className="border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 placeholder:text-gray-400 text-gray-800"
                                                  />
                                                  <div className="flex flex-wrap gap-2 mt-2">
                                                       {tags.map(
                                                            (tag, index) => (
                                                                 <div
                                                                      key={
                                                                           index
                                                                      }
                                                                      className="bg-gray-100 px-2 py-1 rounded-full text-sm flex items-center gap-1"
                                                                 >
                                                                      {tag}
                                                                      <button
                                                                           type="button"
                                                                           className="text-gray-500 hover:text-red-500"
                                                                      >
                                                                           ×
                                                                      </button>
                                                                 </div>
                                                            )
                                                       )}
                                                  </div>
                                             </div>
                                        </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         />

                         {/* Variants */}
                         {/* This would be a more complex component to handle product variants */}
                         {/* You might want to create a separate component for this */}

                         {/* Prices */}
                         {/* Similarly, prices would be handled in relation to variants */}

                         <div className="md:col-span-3 flex justify-end">
                              <Button
                                   type="submit"
                                   className="bg-primary-500 hover:bg-primary-600"
                              >
                                   Update Product
                              </Button>
                         </div>
                    </form>
               </Form>
               <Toaster position="top-center" richColors closeButton />
          </>
     );
}
