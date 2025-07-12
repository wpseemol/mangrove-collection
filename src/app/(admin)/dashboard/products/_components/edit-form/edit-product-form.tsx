"use client";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Toaster } from "@/components/ui/sonner";
import { addProductSchema } from "@/lib/schemas/zod/add-product-schema";
import { ProductDetailsType } from "@/types/mongoose/product";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import { z } from "zod";
import EditProductDescriptionFiled from "./edit-product-description-filed";
import EditProductNameFiled from "./edit-product-name-filed";
import EditProductSlugFiled from "./edit-product-slug-filed";
import EditProductThumbnailFiled from "./edit-product-thumbnail-filed";
import EditProductUnitFiled from "./edit-product-unit-filed";

export default function EditProductForm({
     productInfo,
}: {
     productInfo: ProductDetailsType;
}) {
     const form = useForm<z.infer<typeof addProductSchema>>({
          resolver: zodResolver(addProductSchema),
          defaultValues: {
               name: productInfo.name || "",
               slug: productInfo.slug || "",
               unit: productInfo.unit || "pc",
               description: productInfo.description,
               thumbnail: productInfo.thumbnail || "",
               images: productInfo.images || [],
               variants: productInfo.variants || [
                    { id: "defaultId", type: "default", title: "Default" },
               ],
               currency: productInfo.currency || "taka",
               price: productInfo.price || [
                    { variantId: "defaultId", price: 1, select: true },
               ],
               category: "some test",
               shortDescription: productInfo.shortDescription || "",
               tags: productInfo.tags || [],
          },
     });

     /**
      * test for error console.log();
      */
     console.log("Form errors:", form.formState.errors);

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
               console.log("error:", error);
               // Handle error
          }
     }

     return (
          <>
               <Form {...form}>
                    <form
                         onSubmit={form.handleSubmit(onSubmit)}
                         className="space-y-4 "
                    >
                         {/* Product Name */}
                         <EditProductNameFiled form={form} />
                         <div className="flex items-center">
                              {/* Slug */}
                              <EditProductSlugFiled form={form} />
                              {/* Unit */}
                              <EditProductUnitFiled form={form} />
                         </div>

                         <div className="">
                              <EditProductDescriptionFiled form={form} />
                         </div>

                         <EditProductThumbnailFiled form={form} />

                         {/* Currency */}
                         {/* <FormField
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
                         /> */}

                         {/* Category */}
                         {/* <FormField
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
                         /> */}

                         {/* Short Description */}
                         {/* <FormField
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
                         /> */}

                         {/* Description */}
                         {/* <FormField
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
                         /> */}

                         {/* Thumbnail */}
                         {/* <FormField
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
                         {/* </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         /> */}

                         {/* Images */}
                         {/* <FormField
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
                         {/* </FormControl>
                                        <FormMessage className="text-red-500 text-sm" />
                                   </FormItem>
                              )}
                         /> */}

                         {/* Tags */}
                         {/* <FormField
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
                         /> */}

                         {/* Variants */}
                         {/* This would be a more complex component to handle product variants */}
                         {/* You might want to create a separate component for this */}

                         {/* Prices */}
                         {/* Similarly, prices would be handled in relation to variants */}

                         <DialogFooter className="mt-4">
                              <DialogClose asChild>
                                   <Button
                                        type="button"
                                        variant="outline"
                                        className="cursor-pointer border-[1px]"
                                   >
                                        Cancel
                                   </Button>
                              </DialogClose>
                              <Button
                                   type="submit"
                                   className="bg-primary-500 hover:bg-primary-600 shadow cursor-pointer border border-green-700/85"
                              >
                                   Save changes
                              </Button>
                         </DialogFooter>
                    </form>
               </Form>
               <Toaster position="top-center" richColors closeButton />
          </>
     );
}

export type EditProductFormType = UseFormReturn<
     z.infer<typeof addProductSchema>
>;
